import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createHmac } from "crypto"

function tokenForUser(userId: string) {
  return createHmac("sha256", process.env.CALENDAR_SECRET!).update(userId).digest("hex")
}

function fmtDt(iso: string) {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "").replace("Z", "Z")
}

function icsEscape(str: string) {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token || !process.env.CALENDAR_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { users } } = await admin.auth.admin.listUsers()
  const user = users?.find((u) => tokenForUser(u.id) === token)
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { data: events } = await admin
    .from("calendar_events")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "abgesagt")
    .order("start_time")

  const now = fmtDt(new Date().toISOString())

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NSH Dashboard//DE",
    "X-WR-CALNAME:NSH Termine",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ]

  for (const ev of events ?? []) {
    const cleanTitle = ev.title.replace(/^\[.*?\]\s*/, "")
    lines.push("BEGIN:VEVENT")
    lines.push(`UID:${ev.id}@nshrenovierung.vercel.app`)
    lines.push(`DTSTAMP:${now}`)
    lines.push(`DTSTART:${fmtDt(new Date(ev.start_time).toISOString())}`)
    lines.push(`DTEND:${fmtDt(new Date(ev.end_time).toISOString())}`)
    lines.push(`SUMMARY:${icsEscape(cleanTitle)}`)
    if (ev.notes) lines.push(`DESCRIPTION:${icsEscape(ev.notes)}`)
    lines.push(`STATUS:${ev.status === "erledigt" ? "COMPLETED" : "CONFIRMED"}`)
    lines.push("END:VEVENT")
  }

  lines.push("END:VCALENDAR")

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}

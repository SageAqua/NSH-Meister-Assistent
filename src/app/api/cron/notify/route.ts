import { NextRequest, NextResponse } from "next/server"
import webpush from "web-push"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const headerAuth = req.headers.get("authorization")
  const querySecret = req.nextUrl.searchParams.get("secret")
  if (headerAuth !== `Bearer ${secret}` && querySecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = Date.now()
  const MS = 60 * 60 * 1000 // 1 hour in ms
  const WINDOW = 30 * 60 * 1000 // ±30 min window

  const ranges = {
    "1day": {
      from: new Date(now + 23.5 * MS).toISOString(),
      to: new Date(now + 24.5 * MS).toISOString(),
      col: "notify_1day" as const,
    },
    "1hour": {
      from: new Date(now + 0.5 * MS).toISOString(),
      to: new Date(now + 1.5 * MS).toISOString(),
      col: "notify_1hour" as const,
    },
  }

  let totalSent = 0

  for (const [type, range] of Object.entries(ranges)) {
    const { data: eventsToNotify } = await adminSupabase
      .from("calendar_events")
      .select("id, user_id, title, start_time")
      .gte("start_time", range.from)
      .lte("start_time", range.to)
      .neq("status", "abgesagt")

    if (!eventsToNotify?.length) continue

    for (const event of eventsToNotify) {
      // Skip if already notified
      const { data: logged } = await adminSupabase
        .from("notification_log")
        .select("id")
        .eq("event_id", event.id)
        .eq("notification_type", type)
        .maybeSingle()

      if (logged) continue

      // Get this user's subscriptions with the matching pref enabled
      const { data: subs } = await adminSupabase
        .from("push_subscriptions")
        .select("id, subscription")
        .eq("user_id", event.user_id)
        .eq(range.col, true)

      if (!subs?.length) continue

      const startTime = new Date(event.start_time)
      const timeStr = startTime.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Berlin",
      })
      const dateStr = startTime.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Europe/Berlin",
      })
      const cleanTitle = event.title.replace(/^\[.*?\]\s*/, "")

      const payload = JSON.stringify({
        title: type === "1day" ? `Morgen: ${cleanTitle}` : `In 1 Stunde: ${cleanTitle}`,
        body: type === "1day" ? `${dateStr} um ${timeStr} Uhr` : `Heute um ${timeStr} Uhr`,
        url: "/heute",
      })

      for (const sub of subs) {
        try {
          await webpush.sendNotification(sub.subscription as webpush.PushSubscription, payload)
          totalSent++
        } catch (err: unknown) {
          const e = err as { statusCode?: number }
          if (e.statusCode === 410 || e.statusCode === 404) {
            await adminSupabase.from("push_subscriptions").delete().eq("id", sub.id)
          }
        }
      }

      await adminSupabase
        .from("notification_log")
        .insert({ event_id: event.id, notification_type: type })
    }
  }

  return NextResponse.json({ ok: true, sent: totalSent })
}

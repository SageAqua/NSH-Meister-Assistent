import { createClient } from "@/lib/supabase/server"
import { KalenderClient } from "./kalender-client"
import type { CalendarEvent } from "@/types"

export default async function KalenderPage() {
  const supabase = await createClient()

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()

  const { data: events } = await supabase
    .from("calendar_events")
    .select("*, projects(*, customers(*))")
    .gte("start_time", start)
    .lte("start_time", end)
    .order("start_time")

  return <KalenderClient events={(events ?? []) as CalendarEvent[]} />
}

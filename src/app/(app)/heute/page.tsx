import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HardHat,
  Plus,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { markTaskDone } from "@/app/actions/orders"
import { TagesplanSection } from "./tagesplan"
import { MonthlyCalendar, type MonthlyCalendarEvent } from "./monthly-calendar"
import type { CalendarEvent, Customer, Project, Task } from "@/types"

type ProjectFull = Project & { customers: Customer | null }

function formatDateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")
}

function time(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function serviceName(service: string) {
  const labels: Record<string, string> = {
    vinyl: "Vinyl verlegen", klickvinyl: "Klickvinyl", klebevinyl: "Klebevinyl", laminat: "Laminat",
    waende: "Waende streichen", decke: "Decke streichen", spachtel: "Spachteln", trockenbau: "Trockenbau",
  }
  return labels[service] ?? service
}

function startOfWeek(d: Date): string {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  return formatDateKey(mon) + "T00:00:00"
}

function endOfWeek(d: Date): string {
  const day = d.getDay()
  const diff = day === 0 ? 0 : 7 - day
  const sun = new Date(d)
  sun.setDate(d.getDate() + diff)
  sun.setHours(23, 59, 59, 0)
  return formatDateKey(sun) + "T23:59:59"
}

function startOfMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01T00:00:00`
}

function endOfMonth(d: Date): string {
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return formatDateKey(last) + "T23:59:59"
}

function detectEventType(title: string): "privat" | "arbeit" | "baustelle" {
  const t = title.toLowerCase()
  if (t.includes("[privat]")) return "privat"
  if (t.includes("[baustelle]")) return "baustelle"
  return "arbeit"
}

function buildWeekDays(events: CalendarEvent[], today: Date) {
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(today)
  mon.setDate(today.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    const dateStr = formatDateKey(d)
    const label = d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric" })
    return {
      dateStr,
      label,
      events: events.filter((e) => e.start_time.startsWith(dateStr)),
    }
  })
}

function EventPill({ event }: { event: CalendarEvent }) {
  const type = detectEventType(event.title)
  const cls =
    type === "privat"
      ? "bg-violet-100 text-violet-800"
      : type === "baustelle"
        ? "bg-amber-100 text-amber-800"
        : "bg-blue-100 text-blue-800"
  const clean = event.title.replace(/^\[.*?\]\s*/, "")
  return (
    <span className={`inline-block rounded-lg px-2 py-1 text-xs font-bold leading-tight ${cls}`}>
      {time(event.start_time)} {clean}
    </span>
  )
}

function WeekPreview({ events, today }: { events: CalendarEvent[]; today: Date }) {
  const days = buildWeekDays(events, today)
  const activeDays = days.filter((d) => d.events.length > 0)

  if (activeDays.length === 0) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <p className="text-sm text-muted-foreground">Keine Termine diese Woche.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
          const hasEvents = day.events.length > 0
        return (
          <div
            key={day.dateStr}
            className={`flex min-w-[80px] flex-col gap-1 rounded-xl border px-2 py-2.5 ${hasEvents ? "border-primary/30 bg-primary/5" : "border-transparent bg-muted/30"}`}
          >
            <span className="text-[11px] font-black text-muted-foreground">{day.label}</span>
            {hasEvents ? (
              day.events.map((e) => <EventPill key={e.id} event={e} />)
            ) : (
              <span className="text-[10px] text-muted-foreground/50">Frei</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function OpenTasks({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0)
    return (
      <p className="rounded-lg border bg-card p-4 text-center font-semibold text-muted-foreground">
        Keine offenen Aufgaben.
      </p>
    )
  return (
    <div className="space-y-2">
      {tasks.slice(0, 6).map((task) => (
        <form key={task.id} action={markTaskDone.bind(null, task.id)}>
          <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left shadow-sm active:bg-muted">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary">
              <CheckCircle2 className="size-4 text-primary" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-black">{task.title}</span>
              {task.projects && (
                <span className="block truncate text-sm text-muted-foreground">
                  {task.projects.address ?? serviceName(task.projects.service_type)}
                </span>
              )}
            </span>
          </button>
        </form>
      ))}
    </div>
  )
}

function ActiveProjects({ projects }: { projects: ProjectFull[] }) {
  if (projects.length === 0)
    return (
      <p className="rounded-lg border bg-card p-4 text-center font-semibold text-muted-foreground">
        Keine aktiven Baustellen.
      </p>
    )
  return (
    <div className="space-y-2">
      {projects.slice(0, 5).map((project) => (
        <Link key={project.id} href={`/baustellen/${project.id}`}>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted active:bg-muted">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Building2 className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-black">{project.customers?.name ?? "Ohne Kunde"}</p>
              <p className="truncate text-sm text-muted-foreground">
                {serviceName(project.service_type)}
                {project.address ? ` - ${project.address}` : ""}
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  )
}

export default async function HeutePage() {
  const supabase = await createClient()
  const today = new Date()
  const todayStr = formatDateKey(today)
  const startOfDay = `${todayStr}T00:00:00`
  const endOfDay = `${todayStr}T23:59:59`

  const [
    { data: todayEventsRaw },
    { data: weekEventsRaw },
    { data: monthEventsRaw },
    { data: tasksRaw },
    { data: projectsRaw },
  ] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("*, projects(*, customers(*))")
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay)
      .neq("status", "abgesagt")
      .order("start_time"),
    supabase
      .from("calendar_events")
      .select("*, projects(*, customers(*))")
      .gte("start_time", startOfWeek(today))
      .lte("start_time", endOfWeek(today))
      .neq("status", "abgesagt")
      .order("start_time"),
    supabase
      .from("calendar_events")
      .select("*, projects(*, customers(*))")
      .gte("start_time", startOfMonth(today))
      .lte("start_time", endOfMonth(today))
      .neq("status", "abgesagt")
      .order("start_time"),
    supabase
      .from("tasks")
      .select("*, projects(*)")
      .eq("is_done", false)
      .order("due_date", { ascending: true })
      .limit(6),
    supabase
      .from("projects")
      .select("*, customers(*)")
      .in("status", ["in_arbeit", "geplant"])
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const todayEvents = (todayEventsRaw ?? []) as CalendarEvent[]
  const weekEvents = (weekEventsRaw ?? []) as CalendarEvent[]
  const monthEvents = (monthEventsRaw ?? []) as CalendarEvent[]
  const tasks = (tasksRaw ?? []) as Task[]
  const projects = (projectsRaw ?? []) as ProjectFull[]

  const monthEventsMap = monthEvents.reduce<Record<string, MonthlyCalendarEvent[]>>((acc, ev) => {
    const key = ev.start_time.slice(0, 7)
    const date = ev.start_time.split("T")[0]
    if (!acc[key]) acc[key] = []
    acc[key].push({
      id: ev.id,
      date,
      startTime: time(ev.start_time),
      endTime: time(ev.end_time),
      title: ev.title.replace(/^\[.*?\]\s*/, ""),
      status: ev.status,
    })
    return acc
  }, {})

  return (
    <div className="nsh-page">
      <header className="nsh-panel p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="nsh-eyebrow">Heute</p>
            <h1 className="nsh-title">Hallo Naim</h1>
            <p className="nsh-subtitle">
              {today.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <img
            src="/logo.png"
            alt="NSH Renovierung"
            className="size-14 rounded-lg bg-white object-contain ring-1 ring-border"
          />
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <CalendarDays className="size-5 text-primary" /> Diese Woche
        </h2>
        <WeekPreview events={weekEvents} today={today} />
      </section>

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <ClipboardList className="size-5 text-primary" /> Aufgaben heute
        </h2>
        <OpenTasks tasks={tasks} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <CalendarDays className="size-6 text-primary" /> Termine heute
          </h2>
          <Link href="/neuer-auftrag" className="inline-flex">
            <Button size="sm" className="gap-2">
              <Plus className="size-4" /> Neu
            </Button>
          </Link>
        </div>
        <TagesplanSection events={todayEvents} freeSlots={[]} today={todayStr} />
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <CalendarDays className="size-6 text-primary" /> Dieser Monat
          </h2>
          <MonthlyCalendar monthEventsMap={monthEventsMap} today={todayStr} />
        </section>
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <HardHat className="size-6 text-primary" /> Laufende Baustellen
          </h2>
          <ActiveProjects projects={projects} />
        </section>
      </div>
    </div>
  )
}

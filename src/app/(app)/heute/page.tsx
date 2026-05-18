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

function MonthlyOverview({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) return <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">Kein Termin im aktuellen Monat.</p>
  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const day = event.start_time.split("T")[0]
    if (!acc[day]) acc[day] = []
    acc[day].push(event)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {Object.entries(grouped).slice(0, 10).map(([day, list]) => (
        <div key={day} className="rounded-lg border bg-card p-3">
          <p className="text-sm font-black">{new Date(`${day}T12:00:00`).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}</p>
          <div className="mt-2 space-y-1">
            {list.map((event) => <p key={event.id} className="text-sm text-muted-foreground">{time(event.start_time)} · {event.title}</p>)}
          </div>
        </div>
      ))}
    </div>
  )
}

function WeekPreview({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm font-black text-primary">Diese Woche / Këtë javë</p>
      {events.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">Keine Termine diese Woche.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {events.slice(0, 5).map((event) => (
            <li key={event.id} className="text-sm"><span className="font-bold">{new Date(event.start_time).toLocaleDateString("de-DE", { weekday: "short" })}</span> · {time(event.start_time)} · {event.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function OpenTasks({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return <p className="rounded-lg border bg-card p-4 text-center font-semibold text-muted-foreground">Keine offenen Aufgaben heute.</p>
  return (
    <div className="space-y-2">
      {tasks.slice(0, 4).map((task) => (
        <form key={task.id} action={markTaskDone.bind(null, task.id)}>
          <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left shadow-sm">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary"><CheckCircle2 className="size-4 text-primary" /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-base font-black">{task.title}</span>{task.projects && <span className="block truncate text-sm text-muted-foreground">{task.projects.address ?? serviceName(task.projects.service_type)}</span>}</span>
          </button>
        </form>
      ))}
    </div>
  )
}

function ActiveProjects({ projects }: { projects: ProjectFull[] }) {
  if (projects.length === 0) return <p className="rounded-lg border bg-card p-4 text-center font-semibold text-muted-foreground">Keine aktiven Baustellen.</p>
  return (
    <div className="space-y-2">
      {projects.slice(0, 5).map((project) => (
        <Link key={project.id} href={`/baustellen/${project.id}`}>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Building2 className="size-6" /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-lg font-black">{project.customers?.name ?? "Ohne Kunde"}</p><p className="truncate text-sm text-muted-foreground">{serviceName(project.service_type)}{project.address ? ` - ${project.address}` : ""}</p></div>
            <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  )
}

export default async function HeutePage({ searchParams }: { searchParams: Promise<{ "new-event"?: string; type?: "privat" | "arbeit" | "baustelle" }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const today = new Date()
  const todayStr = formatDateKey(today)
  const startOfDay = `${todayStr}T00:00:00`
  const endOfDay = `${todayStr}T23:59:59`

  const weekStart = new Date(today)
  const day = weekStart.getDay()
  weekStart.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

  const [{ data: todayEventsRaw }, { data: weekEventsRaw }, { data: monthEventsRaw }, { data: tasksRaw }, { data: projectsRaw }] = await Promise.all([
    supabase.from("calendar_events").select("*, projects(*, customers(*))").gte("start_time", startOfDay).lte("start_time", endOfDay).neq("status", "abgesagt").order("start_time"),
    supabase.from("calendar_events").select("*").gte("start_time", weekStart.toISOString()).lte("start_time", weekEnd.toISOString()).neq("status", "abgesagt").order("start_time"),
    supabase.from("calendar_events").select("*").gte("start_time", monthStart.toISOString()).lte("start_time", monthEnd.toISOString()).neq("status", "abgesagt").order("start_time"),
    supabase.from("tasks").select("*, projects(*)").eq("is_done", false).or(`due_date.is.null,due_date.eq.${todayStr}`).order("due_date", { ascending: true }).limit(6),
    supabase.from("projects").select("*, customers(*)").in("status", ["in_arbeit", "geplant"]).order("created_at", { ascending: false }).limit(6),
  ])

  const todayEvents = (todayEventsRaw ?? []) as CalendarEvent[]
  const weekEvents = (weekEventsRaw ?? []) as CalendarEvent[]
  const monthEvents = (monthEventsRaw ?? []) as CalendarEvent[]
  const tasks = (tasksRaw ?? []) as Task[]
  const projects = (projectsRaw ?? []) as ProjectFull[]

  if (params["new-event"]) {
    const type = params.type === "privat" || params.type === "baustelle" || params.type === "arbeit" ? params.type : "arbeit"
    return (
      <div className="nsh-page">
        <header className="nsh-panel p-4 sm:p-5"><p className="nsh-eyebrow">Neuer Termin</p><h1 className="nsh-title">Eintragen in 20 Sekunden</h1></header>
        <TagesplanSection events={todayEvents} freeSlots={[]} today={todayStr} autoOpenForm initialEventType={type} />
      </div>
    )
  }

  return (
    <div className="nsh-page">
      <header className="nsh-panel p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="nsh-eyebrow">Heute</p>
            <h1 className="nsh-title">Hallo Naim</h1>
            <p className="nsh-subtitle">Alles Wichtige zuerst. / Gjithçka e rëndësishme e para.</p>
          </div>
          <img src="/logo.png" alt="NSH Renovierung" className="size-14 rounded-lg bg-white object-contain ring-1 ring-border" />
        </div>
      </header>

      <div className="space-y-5 md:hidden">
        <WeekPreview events={weekEvents} />
        <section className="space-y-2"><h2 className="flex items-center gap-2 text-lg font-black"><ClipboardList className="size-5 text-primary" /> Aufgabe heute</h2><OpenTasks tasks={tasks} /></section>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-black"><CalendarDays className="size-6 text-primary" /> Termine heute</h2>
          <Link href="/neuer-auftrag" className="inline-flex"><Button size="sm" className="gap-2"><Plus className="size-4" /> Neu</Button></Link>
        </div>
        <TagesplanSection events={todayEvents} freeSlots={[]} today={todayStr} />
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3"><h2 className="flex items-center gap-2 text-xl font-black"><CalendarDays className="size-6 text-primary" /> Monatstermine</h2><MonthlyOverview events={monthEvents} /></section>
        <section className="space-y-3"><h2 className="flex items-center gap-2 text-xl font-black"><HardHat className="size-6 text-primary" /> Laufende Baustellen</h2><ActiveProjects projects={projects} /></section>
      </div>

      <section className="space-y-3 hidden md:block">
        <h2 className="flex items-center gap-2 text-xl font-black"><ClipboardList className="size-6 text-primary" /> Aufgaben heute</h2>
        <OpenTasks tasks={tasks} />
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href="/kunden" className="rounded-lg border bg-card p-4 font-bold hover:bg-muted">Kunden / Klientët</Link>
        <Link href="/notizen" className="rounded-lg border bg-card p-4 font-bold hover:bg-muted">Notizen / Shënime</Link>
        <Link href="/kalender" className="rounded-lg border bg-card p-4 font-bold hover:bg-muted">Kalender / Kalendar</Link>
      </div>
    </div>
  )
}

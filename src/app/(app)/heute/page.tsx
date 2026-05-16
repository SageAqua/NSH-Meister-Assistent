import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  Plus,
  FileText,
  HardHat,
  ChevronRight,
  Calculator,
  User,
  CalendarPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { markTaskDone } from "@/app/actions/orders"
import { TagesplanSection } from "./tagesplan"
import { MonthlyCalendar, type MonthlyCalendarEvent } from "./monthly-calendar"
import { SERVICES } from "@/lib/calculations/pricing"
import type { FreeSlot } from "./tagesplan"
import type { CalendarEvent, Task, Project, Customer, PriceCalculation } from "@/types"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Guten Morgen"
  if (hour < 17) return "Guten Tag"
  return "Guten Abend"
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

// ─── Numbered section wrapper ────────────────────────────────────────────────
function NumberedSection({
  number,
  de,
  sq,
  children,
}: {
  number: number
  de: string
  sq: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {number}
        </div>
        <div>
          <p className="font-bold leading-tight">{de}</p>
          <p className="text-xs text-muted-foreground">{sq}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Offene Aufgaben ─────────────────────────────────────────────────────────
function OffeneAufgaben({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border bg-card px-4 py-3 text-center text-sm text-muted-foreground">
        Keine offenen Aufgaben 🎉
      </p>
    )
  }
  const shown = tasks.slice(0, 3)
  const rest = tasks.length - shown.length

  return (
    <div className="space-y-1.5">
      {shown.map((task) => (
        <form key={task.id} action={markTaskDone.bind(null, task.id)}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent"
          >
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{task.title}</p>
              {task.projects && (
                <p className="truncate text-xs text-muted-foreground">
                  {task.projects.address ?? task.projects.service_type}
                </p>
              )}
            </div>
            {task.due_date && (
              <span className="shrink-0 text-xs text-destructive">
                {new Date(task.due_date).toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </button>
        </form>
      ))}
      {rest > 0 && (
        <Link href="/baustellen">
          <p className="py-1.5 text-center text-sm font-semibold text-primary">
            {rest} weitere anzeigen →
          </p>
        </Link>
      )}
    </div>
  )
}

// ─── Kunden & Baustellen ─────────────────────────────────────────────────────
type ProjectFull = Project & { customers: Customer | null }

function KundenBaustellen({
  projects,
  upcomingEvents,
}: {
  projects: ProjectFull[]
  upcomingEvents: CalendarEvent[]
}) {
  if (projects.length === 0) {
    return (
      <p className="rounded-xl border bg-card px-4 py-3 text-center text-sm text-muted-foreground">
        Keine aktiven Baustellen
      </p>
    )
  }

  const nextEventByProject: Record<string, CalendarEvent> = {}
  for (const ev of upcomingEvents) {
    if (ev.project_id && !nextEventByProject[ev.project_id]) {
      nextEventByProject[ev.project_id] = ev
    }
  }

  return (
    <div className="space-y-1.5">
      {projects.map((p) => {
        const nextEvent = nextEventByProject[p.id]
        const isInArbeit = p.status === "in_arbeit"

        let statusLabel: string
        let dotColor: string
        if (isInArbeit) {
          statusLabel = "In Arbeit"
          dotColor = "bg-green-500"
        } else if (nextEvent) {
          const d = new Date(nextEvent.start_time).toLocaleDateString("de-DE", {
            day: "numeric",
            month: "short",
          })
          statusLabel = `Besichtigung am ${d}`
          dotColor = "bg-primary"
        } else {
          statusLabel = "Geplant"
          dotColor = "bg-primary"
        }

        const subtitle = p.address ?? p.customers?.city ?? ""

        return (
          <Link key={p.id} href={`/baustellen/${p.id}`}>
            <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-accent">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <HardHat className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold">
                  {p.customers?.name ?? "Unbekannter Kunde"}
                </p>
                {subtitle && (
                  <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <div className={cn("size-2 rounded-full", dotColor)} />
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  {statusLabel}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// ─── Preisrechner Widget ──────────────────────────────────────────────────────
function PreisrechnerWidget({ lastCalc }: { lastCalc: PriceCalculation | null }) {
  const service = lastCalc ? SERVICES.find((s) => s.id === lastCalc.service_type) : null

  return (
    <div className="space-y-3">
      {lastCalc && (
        <div className="rounded-xl bg-muted/50 p-3 space-y-1">
          <p className="font-semibold text-sm">{service?.labelDe ?? lastCalc.service_type}</p>
          <p className="text-sm text-muted-foreground">{lastCalc.area_m2} m²</p>
          <p className="text-sm">
            Grobe Spanne:{" "}
            <span className="font-bold text-primary">
              {lastCalc.price_low?.toLocaleString("de-DE")} € –{" "}
              {lastCalc.price_high?.toLocaleString("de-DE")} €
            </span>
          </p>
        </div>
      )}
      <Link href="/preisrechner">
        <Button className="w-full gap-2">
          <Calculator className="size-4" /> Preis berechnen
        </Button>
      </Link>
    </div>
  )
}

// ─── Schnellaktionen ──────────────────────────────────────────────────────────
function Schnellaktionen() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Link href="/neuer-auftrag">
        <div className="flex flex-col items-start gap-1 rounded-xl bg-primary p-4 text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
          <Plus className="size-5" />
          <span className="font-semibold text-sm">Neuer Auftrag</span>
          <span className="text-xs opacity-75">Punë e re</span>
        </div>
      </Link>
      <Link href="/heute?new-event=1">
        <div className="flex flex-col items-start gap-1 rounded-xl bg-primary p-4 text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
          <CalendarPlus className="size-5" />
          <span className="font-semibold text-sm">Neuer Termin</span>
          <span className="text-xs opacity-75">Termini i ri</span>
        </div>
      </Link>
      <Link href="/notizen">
        <div className="flex flex-col items-start gap-1 rounded-xl border-2 border-border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
          <FileText className="size-5" />
          <span className="font-semibold text-sm">Neue Notiz</span>
          <span className="text-xs text-muted-foreground">Shënim i ri</span>
        </div>
      </Link>
      <Link href="/kunden">
        <div className="flex flex-col items-start gap-1 rounded-xl border-2 border-border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
          <User className="size-5" />
          <span className="font-semibold text-sm">Kunde anlegen</span>
          <span className="text-xs text-muted-foreground">Klient i ri</span>
        </div>
      </Link>
    </div>
  )
}

// ─── Free slots helper ────────────────────────────────────────────────────────
function computeFreeSlots(events: CalendarEvent[]): FreeSlot[] {
  const WORK_START = 7 * 60
  const WORK_END = 19 * 60
  const MIN_SLOT = 30

  const toMin = (iso: string) => {
    const d = new Date(iso)
    return d.getHours() * 60 + d.getMinutes()
  }
  const fromMin = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`

  const busy = events
    .filter((e) => e.status !== "abgesagt")
    .map((e) => ({ start: toMin(e.start_time), end: toMin(e.end_time) }))
    .sort((a, b) => a.start - b.start)

  const free: FreeSlot[] = []
  let cursor = WORK_START

  for (const { start, end } of busy) {
    const gap = start - cursor
    if (gap >= MIN_SLOT) {
      free.push({
        startTime: fromMin(cursor),
        endTime: fromMin(start),
        durationHours: Math.round(gap / 30) / 2,
      })
    }
    cursor = Math.max(cursor, end)
  }

  const remaining = WORK_END - cursor
  if (remaining >= MIN_SLOT) {
    free.push({
      startTime: fromMin(cursor),
      endTime: fromMin(WORK_END),
      durationHours: Math.round(remaining / 30) / 2,
    })
  }
  return free
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HeutePage({
  searchParams,
}: {
  searchParams: Promise<{ "new-event"?: string }>
}) {
  const params = await searchParams
  const autoOpenForm = !!params["new-event"]

  const supabase = await createClient()
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  // Month boundaries
  const y = today.getFullYear()
  const m = today.getMonth()

  const currStart = new Date(y, m, 1)
  const currEnd = new Date(y, m + 1, 0)
  const prevStart = new Date(y, m - 1, 1)
  const prevEnd = new Date(y, m, 0)
  const nextStart = new Date(y, m + 1, 1)
  const nextEnd = new Date(y, m + 2, 0)

  const fmt = (d: Date, time: string) => `${d.toISOString().split("T")[0]}T${time}`

  const startOfDay = `${todayStr}T00:00:00`
  const endOfDay = `${todayStr}T23:59:59`

  const [
    { data: eventsRaw },
    { data: tasksRaw },
    { data: projectsRaw },
    { data: upcomingRaw },
    { data: prevEventsRaw },
    { data: nextEventsRaw },
    { data: lastCalcRaw },
  ] = await Promise.all([
    // Today's events
    supabase
      .from("calendar_events")
      .select("*, projects(*, customers(*))")
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay)
      .order("start_time"),

    // Open tasks due today or earlier
    supabase
      .from("tasks")
      .select("*, projects(*)")
      .lte("due_date", todayStr)
      .eq("is_done", false)
      .order("due_date"),

    // Active + planned projects
    supabase
      .from("projects")
      .select("*, customers(*)")
      .in("status", ["in_arbeit", "geplant"])
      .order("created_at", { ascending: false })
      .limit(6),

    // Upcoming events this month (after today)
    supabase
      .from("calendar_events")
      .select("*, projects(*, customers(*))")
      .gt("start_time", endOfDay)
      .lte("start_time", fmt(currEnd, "23:59:59"))
      .neq("status", "abgesagt")
      .order("start_time"),

    // Prev month events for calendar
    supabase
      .from("calendar_events")
      .select("*, projects(*, customers(*))")
      .gte("start_time", fmt(prevStart, "00:00:00"))
      .lte("start_time", fmt(prevEnd, "23:59:59"))
      .neq("status", "abgesagt")
      .order("start_time"),

    // Next month events for calendar
    supabase
      .from("calendar_events")
      .select("*, projects(*, customers(*))")
      .gte("start_time", fmt(nextStart, "00:00:00"))
      .lte("start_time", fmt(nextEnd, "23:59:59"))
      .neq("status", "abgesagt")
      .order("start_time"),

    // Last price calculation
    supabase
      .from("price_calculations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  const todayEvents = (eventsRaw ?? []) as CalendarEvent[]
  const openTasks = (tasksRaw ?? []) as Task[]
  const projects = (projectsRaw ?? []) as ProjectFull[]
  const upcomingEvents = (upcomingRaw ?? []) as CalendarEvent[]
  const lastCalc = (lastCalcRaw?.[0] ?? null) as PriceCalculation | null

  const freeSlots = computeFreeSlots(todayEvents)

  // Build monthEventsMap for calendar
  const currMonthKey = `${y}-${String(m + 1).padStart(2, "0")}`
  const prevMonthKey = `${m === 0 ? y - 1 : y}-${String(m === 0 ? 12 : m).padStart(2, "0")}`
  const nextMonthKey = `${m === 11 ? y + 1 : y}-${String(m === 11 ? 1 : m + 2).padStart(2, "0")}`

  const toMonthlyEvent = (event: CalendarEvent): MonthlyCalendarEvent => ({
    id: event.id,
    date: event.start_time.split("T")[0],
    startTime: formatTime(event.start_time),
    endTime: formatTime(event.end_time),
    title: event.title,
    customer: event.projects?.customers?.name,
    status: event.status,
  })

  const monthEventsMap: Record<string, MonthlyCalendarEvent[]> = {
    [prevMonthKey]: ((prevEventsRaw ?? []) as CalendarEvent[]).map(toMonthlyEvent),
    [currMonthKey]: [...todayEvents, ...upcomingEvents].map(toMonthlyEvent),
    [nextMonthKey]: ((nextEventsRaw ?? []) as CalendarEvent[]).map(toMonthlyEvent),
  }

  const greeting = getGreeting()
  const dateStr = today.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{greeting}, Naim</h1>
          <p className="capitalize text-muted-foreground">{dateStr}</p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          N
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-8">
          <NumberedSection number={1} de="Heutige Termine" sq="Terminet e sotme">
            <TagesplanSection
              events={todayEvents}
              freeSlots={freeSlots}
              today={todayStr}
              autoOpenForm={autoOpenForm}
            />
          </NumberedSection>

          <NumberedSection number={3} de="Kunden & Baustellen" sq="Klientë & Punime">
            <KundenBaustellen projects={projects} upcomingEvents={upcomingEvents} />
          </NumberedSection>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <NumberedSection number={2} de="Offene Aufgaben" sq="Detyra të hapura">
            <OffeneAufgaben tasks={openTasks} />
          </NumberedSection>

          <NumberedSection number={4} de="Preisrechner" sq="Logarit çmimin">
            <PreisrechnerWidget lastCalc={lastCalc} />
          </NumberedSection>

          <NumberedSection number={5} de="Schnellaktionen" sq="Veprime të shpejta">
            <Schnellaktionen />
          </NumberedSection>
        </div>
      </div>

      {/* ── Monthly calendar — full width ── */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          📆 Kalender
        </h2>
        <MonthlyCalendar monthEventsMap={monthEventsMap} today={todayStr} />
      </div>
    </div>
  )
}

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
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { markTaskDone } from "@/app/actions/orders"
import { TagesplanSection } from "./tagesplan"
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

function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
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
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Link href="/neuer-auftrag">
        <div className="flex min-h-20 flex-col items-start gap-1 rounded-xl bg-primary p-3 text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
          <Plus className="size-5" />
          <span className="font-semibold text-sm">Neuer Auftrag</span>
          <span className="text-xs opacity-75">Punë e re</span>
        </div>
      </Link>
      <Link href="/heute?new-event=1">
        <div className="flex min-h-20 flex-col items-start gap-1 rounded-xl bg-primary p-3 text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
          <CalendarPlus className="size-5" />
          <span className="font-semibold text-sm">Neuer Termin</span>
          <span className="text-xs opacity-75">Termini i ri</span>
        </div>
      </Link>
      <Link href="/notizen">
        <div className="flex min-h-20 flex-col items-start gap-1 rounded-xl border-2 border-border bg-card p-3 hover:bg-accent transition-colors cursor-pointer">
          <FileText className="size-5" />
          <span className="font-semibold text-sm">Neue Notiz</span>
          <span className="text-xs text-muted-foreground">Shënim i ri</span>
        </div>
      </Link>
      <Link href="/kunden">
        <div className="flex min-h-20 flex-col items-start gap-1 rounded-xl border-2 border-border bg-card p-3 hover:bg-accent transition-colors cursor-pointer">
          <User className="size-5" />
          <span className="font-semibold text-sm">Kunde anlegen</span>
          <span className="text-xs text-muted-foreground">Klient i ri</span>
        </div>
      </Link>
    </div>
  )
}

// ─── Free slots helper ────────────────────────────────────────────────────────
function UpcomingWeekPreview({
  events,
  today,
}: {
  events: CalendarEvent[]
  today: string
}) {
  const start = new Date(today + "T12:00:00")
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const endKey = formatDateKey(end)

  const weekEvents = events
    .filter((event) => {
      const key = event.start_time.split("T")[0]
      return key >= today && key <= endKey && event.status !== "abgesagt"
    })
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const grouped = weekEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = event.start_time.split("T")[0]
    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {})

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold leading-tight">Naechste 7 Tage</p>
          <p className="text-xs text-muted-foreground">Kompakte Termin-Vorschau</p>
        </div>
        <Link href="/kalender" className="flex items-center gap-1.5 text-xs font-bold text-primary">
          <CalendarDays className="size-4" />
          Kalender
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-7">
        {days.map((date) => {
          const key = formatDateKey(date)
          const dayEvents = grouped[key] ?? []
          const isToday = key === today
          return (
            <div
              key={key}
              className={cn(
                "rounded-lg border bg-background p-2 sm:min-h-20 sm:p-1.5",
                dayEvents.length > 0 && "border-primary/30 bg-primary/5",
                isToday && "border-primary"
              )}
            >
              <p className={cn("text-[10px] font-bold text-muted-foreground", isToday && "text-primary")}>
                {isToday ? "Heute" : date.toLocaleDateString("de-DE", { weekday: "short" })}
              </p>
              <p className="text-sm font-black">{date.getDate()}</p>
              {dayEvents.length > 0 ? (
                <div className="mt-1 space-y-1">
                  <p className="truncate rounded bg-primary px-1 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {formatTime(dayEvents[0].start_time)} {dayEvents[0].title}
                  </p>
                  {dayEvents.length > 1 && (
                    <p className="text-[10px] font-bold text-primary">+{dayEvents.length - 1}</p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-[10px] text-muted-foreground">frei</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
  const todayStr = formatDateKey(today)

  // Month boundaries
  const y = today.getFullYear()
  const m = today.getMonth()

  const currEnd = new Date(y, m + 1, 0)
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

  const weekPreviewEvents = [
    ...todayEvents,
    ...upcomingEvents,
    ...((nextEventsRaw ?? []) as CalendarEvent[]),
  ]

  const greeting = getGreeting()
  const dateStr = today.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black md:text-3xl">{greeting}, Naim</h1>
          <p className="text-sm capitalize text-muted-foreground">{dateStr}</p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-border">
          <img src="/logo.png" alt="NSH Renovierung" className="size-12 object-contain" />
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Left column */}
        <div className="space-y-4">
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
        <div className="space-y-4">
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

      {/* Next 7 days */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          📆 Kalender
        </h2>
        <UpcomingWeekPreview events={weekPreviewEvents} today={todayStr} />
      </div>
    </div>
  )
}

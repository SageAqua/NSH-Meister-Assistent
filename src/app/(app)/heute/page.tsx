import Link from "next/link"
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FileCheck,
  Plus,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { markTaskDone } from "@/app/actions/orders"
import type { CalendarEvent, Customer, Project, Task, DocumentRecord } from "@/types"
import { TimeTracker } from "./time-tracker"
import { TodayWorkPlanner } from "./today-work-planner"
import {
  APP_TIME_ZONE,
  addDaysToDateKey,
  formatDateKeyInTimeZone,
  formatTimeInTimeZone,
  localDateTimeToUtcIso,
  weekdayFromDateKey,
} from "@/lib/date-time"

type ProjectFull = Project & { customers: Customer | null }

function formatDateKey(date: Date) {
  return formatDateKeyInTimeZone(date)
}

function time(iso: string) {
  return formatTimeInTimeZone(iso)
}

function serviceName(service: string) {
  const labels: Record<string, string> = {
    vinyl: "Vinyl verlegen", klickvinyl: "Klickvinyl", klebevinyl: "Klebevinyl", laminat: "Laminat",
    waende: "Wände streichen", decke: "Decke streichen", spachtel: "Spachteln", trockenbau: "Trockenbau",
  }
  return labels[service] ?? service
}

function startOfWeek(d: Date): string {
  const dateKey = formatDateKey(d)
  const day = weekdayFromDateKey(dateKey)
  const diff = day === 0 ? -6 : 1 - day
  return localDateTimeToUtcIso(addDaysToDateKey(dateKey, diff), "00:00:00")
}

function endOfWeek(d: Date): string {
  const dateKey = formatDateKey(d)
  const day = weekdayFromDateKey(dateKey)
  const diff = day === 0 ? 0 : 7 - day
  return localDateTimeToUtcIso(addDaysToDateKey(dateKey, diff), "23:59:59")
}

function detectEventType(title: string): "privat" | "arbeit" | "baustelle" {
  const t = title.toLowerCase()
  if (t.includes("[privat]")) return "privat"
  if (t.includes("[baustelle]")) return "baustelle"
  return "arbeit"
}

function buildWeekDays(events: CalendarEvent[], today: Date) {
  const todayKey = formatDateKey(today)
  const day = weekdayFromDateKey(todayKey)
  const diff = day === 0 ? -6 : 1 - day
  const mondayKey = addDaysToDateKey(todayKey, diff)
  const dayLabels = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
  return Array.from({ length: 7 }, (_, i) => {
    const dateStr = addDaysToDateKey(mondayKey, i)
    return {
      dateStr,
      label: dayLabels[weekdayFromDateKey(dateStr)],
      events: events.filter((e) => formatDateKeyInTimeZone(e.start_time) === dateStr),
    }
  })
}

function buildNextDays(events: CalendarEvent[], today: Date, count = 5) {
  const dayLabels = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
  const todayKey = formatDateKey(today)
  return Array.from({ length: count }, (_, i) => {
    const dateStr = addDaysToDateKey(todayKey, i + 1)
    const [, month, day] = dateStr.split("-").map(Number)
    return {
      dateStr,
      label: dayLabels[weekdayFromDateKey(dateStr)],
      dayNum: day,
      monthStr: new Date(Date.UTC(2000, month - 1, 1)).toLocaleDateString("de-DE", { month: "short", timeZone: "UTC" }),
      events: events.filter((e) => formatDateKeyInTimeZone(e.start_time) === dateStr),
    }
  })
}

// ── Stat Card (desktop) ────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  subtitle,
  primary,
}: {
  title: string
  value: number
  subtitle: string
  primary?: boolean
}) {
  return (
    <div className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 ${primary ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-semibold ${primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{title}</p>
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${primary ? "bg-white/20" : "bg-muted"}`}>
          <ArrowUpRight className={`size-3.5 ${primary ? "text-primary-foreground" : "text-muted-foreground"}`} />
        </span>
      </div>
      <p className={`mt-3 text-4xl font-black tabular-nums ${primary ? "text-primary-foreground" : "text-foreground"}`}>{value}</p>
      <p className={`mt-1.5 text-xs ${primary ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {subtitle}
      </p>
    </div>
  )
}

// ── Stat Chip (mobile strip) ───────────────────────────────────────────────────
function StatChip({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center ${accent ? "bg-primary/10" : "bg-muted/50"}`}>
      <p className={`text-2xl font-black tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">{label}</p>
    </div>
  )
}

// ── Analytics Bar Chart ────────────────────────────────────────────────────────
function AnalyticsChart({ weekDays }: { weekDays: { dateStr: string; label: string; events: CalendarEvent[] }[] }) {
  const max = Math.max(...weekDays.map((d) => d.events.length), 1)
  const totalEvents = weekDays.reduce((sum, day) => sum + day.events.length, 0)
  const workingDays = weekDays.filter((day) => day.events.length > 0).length
  const freeDays = weekDays.length - workingDays
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <p className="text-base font-black text-foreground">Projekt Analyse</p>
      <p className="text-xs text-muted-foreground">Termine diese Woche</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Termine", value: totalEvents },
          { label: "Arbeitstage", value: workingDays },
          { label: "Frei", value: freeDays },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-muted/45 px-3 py-2">
            <p className="text-2xl font-black tabular-nums text-foreground">{item.value}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex h-36 items-end gap-2">
        {weekDays.map((day) => {
          const pct = day.events.length === 0 ? 0 : Math.max((day.events.length / max) * 100, 8)
          const isToday = day.dateStr === formatDateKey(new Date())
          return (
            <div key={day.dateStr} className="group flex flex-1 flex-col items-center gap-1.5">
              {day.events.length > 0 && (
                <span className="text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {day.events.length}
                </span>
              )}
              <div className="h-24 w-full overflow-hidden rounded-lg bg-muted">
                <div
                  className={`w-full rounded-lg transition-all ${isToday ? "bg-primary" : "bg-primary/40 group-hover:bg-primary/70"}`}
                  style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Reminders ─────────────────────────────────────────────────────────────────
function RemindersCard({ events }: { events: CalendarEvent[] }) {
  const next = events[0]
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <p className="text-base font-black text-foreground">Erinnerungen</p>
      {next ? (
        <div className="mt-3 flex flex-col">
          <p className="text-xl font-black leading-snug text-foreground">
            {next.title.replace(/^\[.*?\]\s*/, "")}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {time(next.start_time)} – {time(next.end_time)}
          </p>
          <div className="mt-4">
            <Link href="/kalender">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                <CalendarDays className="size-4" />
                Kalender öffnen
              </button>
            </Link>
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-2 rounded-lg bg-muted/35 px-2.5 py-2">
                <span className="size-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">
                    {event.title.replace(/^\[.*?\]\s*/, "")}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground">
                    {time(event.start_time)} - {time(event.end_time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-4">
          <p className="text-sm font-semibold text-foreground">Keine Termine heute.</p>
          <p className="mt-1 text-xs text-muted-foreground">Zeit fuer Planung, Dokumente oder offene Aufgaben.</p>
        </div>
      )}
    </div>
  )
}

// ── Project List ───────────────────────────────────────────────────────────────
// ── Tasks Card ─────────────────────────────────────────────────────────────────
function TasksCard({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-base font-black text-foreground">Aufgaben</p>
        <Link href="/neuer-auftrag">
          <button className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted">
            <Plus className="size-3" />
            Aufgabe
          </button>
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Keine offenen Aufgaben.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {tasks.slice(0, 4).map((task) => (
            <form key={task.id} action={markTaskDone.bind(null, task.id)}>
              <button className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted active:bg-muted">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                  <CheckCircle2 className="size-3 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
                  {task.projects && (
                    <p className="truncate text-xs text-muted-foreground">
                      {task.projects.address ?? serviceName(task.projects.service_type)}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full border border-primary/30 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Offen
                </span>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Progress Gauge ─────────────────────────────────────────────────────────────
function ProgressGauge({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-5">
      <p className="self-start text-base font-black text-foreground">Fortschritt</p>
      <div className="relative mt-4 flex size-32 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/50" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="text-primary transition-all duration-700"
          />
        </svg>
        <div className="relative text-center">
          <p className="text-3xl font-black text-foreground">{pct}%</p>
          <p className="text-[10px] text-muted-foreground">Erledigt</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{done} von {total} Aufgaben erledigt</p>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function HeutePage() {
  const supabase = await createClient()
  const today = new Date()
  const todayStr = formatDateKey(today)
  const startOfDay = localDateTimeToUtcIso(todayStr, "00:00:00")
  const endOfDay = localDateTimeToUtcIso(todayStr, "23:59:59")
  const tomorrowStart = localDateTimeToUtcIso(addDaysToDateKey(todayStr, 1), "00:00:00")
  const in5DaysEnd = localDateTimeToUtcIso(addDaysToDateKey(todayStr, 5), "23:59:59")

  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.full_name ?? "Naim Shala"
  const firstName = userName.split(" ")[0]

  const [
    { data: todayEventsRaw },
    { data: weekEventsRaw },
    { data: nextWeekEventsRaw },
    { data: tasksRaw },
    { data: projectsRaw },
    { data: recentDocsRaw },
    { count: totalCount },
    { count: activeCount },
    { count: plannedCount },
    { count: doneCount },
    { count: totalTasksCount },
    { count: doneTasksCount },
  ] = await Promise.all([
    supabase.from("calendar_events").select("*, projects(*, customers(*))").gte("start_time", startOfDay).lte("start_time", endOfDay).neq("status", "abgesagt").order("start_time"),
    supabase.from("calendar_events").select("*, projects(*, customers(*))").gte("start_time", startOfWeek(today)).lte("start_time", endOfWeek(today)).neq("status", "abgesagt").order("start_time"),
    supabase.from("calendar_events").select("*").gte("start_time", tomorrowStart).lte("start_time", in5DaysEnd).neq("status", "abgesagt").order("start_time"),
    supabase.from("tasks").select("*, projects(*)").eq("is_done", false).order("due_date", { ascending: true }).limit(5),
    supabase.from("projects").select("*, customers(*)").in("status", ["in_arbeit", "geplant"]).order("created_at", { ascending: false }).limit(12),
    supabase.from("documents").select("id, suggested_filename, amount_gross, doc_direction, created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "in_arbeit"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "geplant"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "fertig"),
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("is_done", true),
  ])

  const todayEvents = (todayEventsRaw ?? []) as CalendarEvent[]
  const weekEvents = (weekEventsRaw ?? []) as CalendarEvent[]
  const nextWeekEvents = (nextWeekEventsRaw ?? []) as CalendarEvent[]
  const tasks = (tasksRaw ?? []) as Task[]
  const projects = (projectsRaw ?? []) as ProjectFull[]
  const recentDocs = (recentDocsRaw ?? []) as Pick<DocumentRecord, "id" | "suggested_filename" | "amount_gross" | "doc_direction" | "created_at">[]
  const weekDays = buildWeekDays(weekEvents, today)
  const nextDays = buildNextDays(nextWeekEvents, today)

  const dateStr = today.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", timeZone: APP_TIME_ZONE })

  return (
    <div className="flex flex-col gap-4 md:gap-5">

      {/* ── Header — desktop only ── */}
      <header className="hidden items-center justify-between gap-4 lg:flex">
        <div className="min-w-0">
          <h1 className="text-2xl font-black leading-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{dateStr} · Hallo {firstName}!</p>
        </div>
        <Link href="/neuer-auftrag">
          <button className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90">
            <Plus className="size-4" />
            <span>Auftrag</span>
          </button>
        </Link>
      </header>

      {/* ── MOBILE ONLY ── */}
      <div className="flex flex-col gap-6 lg:hidden">

        {/* 1. Greeting */}
        <div className="pt-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{dateStr}</p>
          <h1 className="mt-1.5 text-3xl font-black leading-tight">Guten Tag,<br />{firstName}!</h1>
        </div>

        {/* 2. So geht's guide */}
        <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3.5">
          <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">So geht&apos;s</p>
          <div className="space-y-2">
            {[
              { n: "1", text: "Neuen Auftrag anlegen wenn ein Kunde anruft", active: true },
              { n: "2", text: "Jeden Morgen hier checken was heute ansteht", active: true },
              { n: "3", text: "Auftrag als \"Fertig\" markieren wenn die Arbeit fertig ist", active: false },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${step.active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-muted-foreground"}`}>
                  {step.n}
                </span>
                <p className={`text-sm font-semibold leading-snug ${step.active ? "text-foreground" : "text-muted-foreground"}`}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CTA */}
        <Link href="/neuer-auftrag">
          <button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-black text-primary-foreground shadow-md shadow-primary/20">
            <Plus className="size-5" />
            Neuer Auftrag
          </button>
        </Link>

        {/* 4. Stats strip */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatChip label="In Arbeit" value={activeCount ?? 0} />
          <StatChip label="Geplant" value={plannedCount ?? 0} />
          <StatChip label="Fertig" value={doneCount ?? 0} accent />
        </div>

        <TodayWorkPlanner projects={projects} today={todayStr} />

        {/* 5. Today events */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Heute</p>
            <Link href="/kalender">
              <span className="text-xs font-semibold text-primary">Kalender →</span>
            </Link>
          </div>
          {todayEvents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/50 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">Keine Termine heute.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {todayEvents.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                  <div className={`w-1 shrink-0 self-stretch rounded-full ${
                    detectEventType(e.title) === "privat" ? "bg-violet-500" :
                    detectEventType(e.title) === "baustelle" ? "bg-amber-500" :
                    "bg-blue-500"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{e.title.replace(/^\[.*?\]\s*/, "")}</p>
                    <p className="text-xs text-muted-foreground">{time(e.start_time)} – {time(e.end_time)}</p>
                  </div>
                </div>
              ))}
              {todayEvents.length > 3 && (
                <Link href="/kalender">
                  <p className="text-center text-xs font-semibold text-primary">+{todayEvents.length - 3} weitere anzeigen</p>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 6. Diese Woche */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Diese Woche</p>
            <Link href="/kalender">
              <span className="text-xs font-semibold text-primary">Alle →</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {nextDays.map((day) => (
              <div key={day.dateStr} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                <div className="w-10 shrink-0 text-center">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">{day.label}</p>
                  <p className="text-xl font-black leading-tight text-foreground">{day.dayNum}</p>
                  <p className="text-[10px] text-muted-foreground">{day.monthStr}</p>
                </div>
                <div className="h-10 w-px shrink-0 bg-border" />
                <div className="min-w-0 flex-1">
                  {day.events.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Frei</p>
                  ) : (
                    <div className="space-y-0.5">
                      {day.events.slice(0, 2).map((e) => (
                        <p key={e.id} className="truncate text-sm font-semibold text-foreground leading-snug">{e.title.replace(/^\[.*?\]\s*/, "")}</p>
                      ))}
                      {day.events.length > 2 && (
                        <p className="text-xs text-muted-foreground">+{day.events.length - 2} weitere</p>
                      )}
                    </div>
                  )}
                </div>
                {day.events.length > 0 && (
                  <div className={`h-8 w-1.5 shrink-0 rounded-full ${
                    detectEventType(day.events[0].title) === "privat" ? "bg-violet-400" :
                    detectEventType(day.events[0].title) === "baustelle" ? "bg-amber-400" :
                    "bg-blue-400"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 7. Offene Aufgaben */}
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Offene Aufgaben</p>
          {tasks.length === 0 ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border/50 bg-muted/20 px-4 py-4">
              <CheckCircle2 className="size-5 shrink-0 text-green-500" />
              <p className="text-sm font-semibold text-muted-foreground">Alles erledigt — keine offenen Aufgaben.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card">
              {tasks.slice(0, 5).map((task, i) => (
                <form key={task.id} action={markTaskDone.bind(null, task.id)}>
                  <button className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 ${i < Math.min(tasks.length, 5) - 1 ? "border-b border-border" : ""}`}>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-border" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
                      {task.projects && (
                        <p className="truncate text-xs text-muted-foreground">
                          {task.projects.address ?? serviceName(task.projects.service_type)}
                        </p>
                      )}
                    </div>
                  </button>
                </form>
              ))}
            </div>
          )}
        </div>

        {/* 8. Letzte Dokumente */}
        {recentDocs.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Letzte Dokumente</p>
              <Link href="/dokumente">
                <span className="text-xs font-semibold text-primary">Alle →</span>
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentDocs.map((doc) => (
                <Link key={doc.id} href="/dokumente">
                  <div className="flex w-36 shrink-0 flex-col rounded-xl border border-border bg-card p-3">
                    <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-muted">
                      <FileCheck className="size-4 text-muted-foreground" />
                    </div>
                    <p className="truncate text-xs font-bold text-foreground leading-tight">{doc.suggested_filename ?? "Dokument"}</p>
                    <p className={`mt-1 text-sm font-black ${doc.doc_direction === "einnahme" ? "text-green-600" : "text-foreground"}`}>
                      {doc.amount_gross != null
                        ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(doc.amount_gross)
                        : "—"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Stat Cards — desktop only ── */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-4">
        <StatCard title="Gesamt Baustellen" value={totalCount ?? 0} subtitle="Alle Projekte" primary />
        <StatCard title="Abgeschlossen" value={doneCount ?? 0} subtitle="Fertig gestellt" />
        <StatCard title="In Arbeit" value={activeCount ?? 0} subtitle="Laufende Projekte" />
        <StatCard title="Geplant" value={plannedCount ?? 0} subtitle="In Planung" />
      </div>

      {/* ── Desktop: Row 2 — Analytics | Reminders | Projects ── */}
      <div className="hidden items-start gap-4 lg:grid lg:grid-cols-[1fr_280px_260px]">
        <AnalyticsChart weekDays={weekDays} />
        <RemindersCard events={todayEvents} />
        <TodayWorkPlanner projects={projects} today={todayStr} />
      </div>

      {/* ── Desktop: Row 3 — Tasks | Progress | Time Tracker ── */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[1fr_240px_240px]">
        <TasksCard tasks={tasks} />
        <ProgressGauge done={doneTasksCount ?? 0} total={totalTasksCount ?? 0} />
        <TimeTracker />
      </div>

    </div>
  )
}

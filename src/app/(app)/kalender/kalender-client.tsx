"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  Pencil,
  Phone,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatLocalTime, localDateKey } from "@/lib/datetime"
import {
  deleteCalendarEvent,
  markEventDone,
  updateCalendarEvent,
} from "@/app/actions/orders"
import type { CalendarEvent } from "@/types"
import { cn } from "@/lib/utils"

type View = "monat" | "liste" | "woche"

const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const MONTHS_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

function formatTime(iso: string) {
  return formatLocalTime(iso)
}

function isoToDate(iso: string) {
  return localDateKey(iso)
}

function isoToTime(iso: string) {
  return formatLocalTime(iso)
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isSameMonth(iso: string, month: number, year: number) {
  const date = new Date(localDateKey(iso) + "T12:00:00")
  return date.getMonth() === month && date.getFullYear() === year
}

function getInitialMonth(events: CalendarEvent[]) {
  const now = new Date()
  const hasCurrentMonthEvents = events.some((e) => isSameMonth(e.start_time, now.getMonth(), now.getFullYear()))
  if (hasCurrentMonthEvents || events.length === 0) return { month: now.getMonth(), year: now.getFullYear() }
  const nowMs = now.getTime()
  const next = events.find((e) => new Date(e.start_time).getTime() >= nowMs) ?? events[0]
    const d = new Date(localDateKey(next.start_time) + "T12:00:00")
  return { month: d.getMonth(), year: d.getFullYear() }
}

function getEventLocation(event: CalendarEvent) {
  const c = event.projects?.customers
  return [c?.address, c?.city].filter(Boolean).join(", ")
}

function detectEventType(title: string) {
  const t = title.toLowerCase()
  if (t.includes("[privat]")) return "privat" as const
  if (t.includes("[baustelle]")) return "baustelle" as const
  return "arbeit" as const
}

function EventTypeBadge({ title }: { title: string }) {
  const type = detectEventType(title)
  const cfg =
    type === "privat" ? { label: "Privat", sq: "Privat", cls: "bg-violet-100 text-violet-800" }
    : type === "baustelle" ? { label: "Baustelle", sq: "Kantier", cls: "bg-amber-100 text-amber-800" }
    : { label: "Work", sq: "Punë", cls: "bg-blue-100 text-blue-800" }
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", cfg.cls)}><span className="nsh-i18n" data-sq={cfg.sq}>{cfg.label}</span></span>
}

function EmptyState({ month, year }: { month: number; year: number }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center text-muted-foreground">
        <p className="text-lg font-bold text-foreground">
          <span className="nsh-i18n nsh-i18n-center" data-sq={`Nuk ka termine në ${MONTHS_DE[month]} ${year}`}>Keine Termine im {MONTHS_DE[month]} {year}</span>
        </p>
        <p className="text-sm">
          <span className="nsh-i18n nsh-i18n-center" data-sq="Me “Termin i ri” mund të shtosh direkt një termin.">Mit &quot;Neuer Termin&quot; kannst du direkt einen Termin eintragen.</span>
        </p>
      </CardContent>
    </Card>
  )
}

function EventCard({
  event,
  onDelete,
  onEdit,
  dense = false,
}: {
  event: CalendarEvent
  onDelete: () => void
  onEdit: () => void
  dense?: boolean
}) {
  const customer = event.projects?.customers
  const project = event.projects
  const location = getEventLocation(event)

  return (
    <div
      className={cn(
        "rounded-xl border border-l-4 bg-card p-4 shadow-sm",
        event.status === "erledigt" ? "border-l-green-500 opacity-75" : "border-l-primary",
        dense && "p-3"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Clock className="size-4" />
            <span>{formatTime(event.start_time)} – {formatTime(event.end_time)}</span>
            <EventTypeBadge title={event.title} />
            {event.status === "erledigt" && <Badge variant="secondary" className="text-xs"><span className="nsh-i18n" data-sq="Kryer">Erledigt</span></Badge>}
          </div>
          <h3 className={cn("mt-1 font-black", dense ? "text-base" : "text-lg")}>
            {event.title.replace(/^\[.*?\]\s*/, "")}
          </h3>
          {customer?.name && <p className="text-sm font-semibold text-muted-foreground">{customer.name}</p>}
          {location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}
          {event.notes && (
            <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{event.notes}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs" onClick={onEdit}>
            <Pencil className="size-3.5" />
            <span className="nsh-i18n nsh-i18n-button" data-sq="Ndrysho">Ändern</span>
          </Button>
          <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs text-destructive" onClick={onDelete}>
            <Trash2 className="size-3.5" />
            <span className="nsh-i18n nsh-i18n-button" data-sq="Fshi">Löschen</span>
          </Button>
          {event.status !== "erledigt" && (
            <form action={markEventDone.bind(null, event.id)}>
              <Button size="sm" type="submit" className="h-9 gap-1.5 bg-green-600 text-xs text-white hover:bg-green-700">
                <CheckCircle2 className="size-3.5" />
                <span className="nsh-i18n nsh-i18n-button" data-sq="Kryer">Erledigt</span>
              </Button>
            </form>
          )}
          {customer?.phone && (
            <a href={`tel:${customer.phone}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted">
              <Phone className="size-3.5" />
              <span className="nsh-i18n nsh-i18n-button" data-sq="Telefono">Anrufen</span>
            </a>
          )}
          {location && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Navigation className="size-3.5" />
              <span className="nsh-i18n nsh-i18n-button" data-sq="Navigim">Navi</span>
            </a>
          )}
          {project && (
            <Link href={`/baustellen/${project.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted">
              <Building2 className="size-3.5" />
              <span className="nsh-i18n nsh-i18n-button" data-sq="Kantier">Baustelle</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Day detail bottom sheet ──────────────────────────────────────────────────

type SelectedDay = { year: number; month: number; dayNum: number; events: CalendarEvent[] }

function DayDetailSheet({
  day,
  onClose,
  onEdit,
  onDelete,
  isPending,
}: {
  day: SelectedDay
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
  isPending: boolean
}) {
  const date = new Date(day.year, day.month, day.dayNum)
  const isToday = isSameDay(date, new Date())
  const dateLabel = date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[88dvh] max-w-lg overflow-y-auto rounded-t-2xl bg-background shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background px-4 py-3">
          <div>
            <p className={cn("text-base font-black capitalize", isToday && "text-primary")}>
              {dateLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              {day.events.length === 0
                ? <span className="nsh-i18n" data-sq="Nuk ka termin">Kein Termin</span>
                : <span className="nsh-i18n" data-sq={`${day.events.length} termine`}>{day.events.length} Termin{day.events.length !== 1 ? "e" : ""}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/neuer-auftrag"
              onClick={onClose}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <CalendarPlus className="size-3.5" />
              <span className="nsh-i18n nsh-i18n-button" data-sq="E re">Neu</span>
            </Link>
            <button
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg hover:bg-accent"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Events */}
        <div className="space-y-3 p-4">
          {day.events.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">
                <span className="nsh-i18n nsh-i18n-center" data-sq="Nuk ka termin në këtë ditë.">Kein Termin an diesem Tag.</span>
              </p>
              <Link
                href="/neuer-auftrag"
                onClick={onClose}
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"
              >
                <CalendarPlus className="size-4" />
                <span className="nsh-i18n nsh-i18n-button" data-sq="Regjistro termin">Termin eintragen</span>
              </Link>
            </div>
          ) : (
            day.events.map((event) => {
              const customer = event.projects?.customers
              const project = event.projects
              const location = getEventLocation(event)
              const cleanTitle = event.title.replace(/^\[.*?\]\s*/, "")

              return (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-xl border bg-card p-4 space-y-3 shadow-sm",
                    event.status === "erledigt" && "opacity-60"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-primary">
                      {formatTime(event.start_time)} – {formatTime(event.end_time)}
                    </span>
                    <EventTypeBadge title={event.title} />
                    {event.status === "erledigt" && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                        <span className="nsh-i18n" data-sq="✓ Kryer">✓ Erledigt</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-lg font-black">{cleanTitle}</p>
                    {customer?.name && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{customer.name}</p>
                    )}
                    {location && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" /> {location}
                      </p>
                    )}
                    {event.notes && (
                      <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                        {event.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { onClose(); onEdit(event) }}
                      className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors hover:bg-accent"
                    >
                      <Pencil className="size-3.5" />
                      <span className="nsh-i18n nsh-i18n-button" data-sq="Ndrysho">Ändern</span>
                    </button>
                    <button
                      onClick={() => { onDelete(event.id); onClose() }}
                      disabled={isPending}
                      className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="nsh-i18n nsh-i18n-button" data-sq="Fshi">Löschen</span>
                    </button>
                    {event.status !== "erledigt" && (
                      <form action={markEventDone.bind(null, event.id)}>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="flex h-9 items-center gap-1.5 rounded-lg bg-green-600 px-3 text-xs font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span className="nsh-i18n nsh-i18n-button" data-sq="Kryer">Erledigt</span>
                        </button>
                      </form>
                    )}
                    {customer?.phone && (
                      <a href={`tel:${customer.phone}`} className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors hover:bg-accent">
                        <Phone className="size-3.5" />
                        <span className="nsh-i18n nsh-i18n-button" data-sq="Telefono">Anrufen</span>
                      </a>
                    )}
                    {location && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors hover:bg-accent"
                      >
                        <Navigation className="size-3.5" />
                        <span className="nsh-i18n nsh-i18n-button" data-sq="Navigim">Navi</span>
                      </a>
                    )}
                    {project && (
                      <Link href={`/baustellen/${project.id}`} onClick={onClose} className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors hover:bg-accent">
                        <Building2 className="size-3.5" />
                        <span className="nsh-i18n nsh-i18n-button" data-sq="Kantier">Baustelle</span>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ── Views ────────────────────────────────────────────────────────────────────

function ListView({
  events, month, year, onDelete, onEdit,
}: {
  events: CalendarEvent[]
  month: number; year: number
  onDelete: (id: string) => void
  onEdit: (event: CalendarEvent) => void
}) {
  if (events.length === 0) return <EmptyState month={month} year={year} />

  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const day = isoToDate(e.start_time)
    if (!acc[day]) acc[day] = []
    acc[day].push(e)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, dayEvents]) => {
        const date = new Date(day + "T12:00:00")
        const isToday = isSameDay(date, new Date())
        return (
          <section key={day}>
            <div className={cn("mb-3 flex items-center gap-2 rounded-xl px-3 py-2", isToday && "bg-primary/10")}>
              <h2 className={cn("text-base font-black capitalize", isToday && "text-primary")}>
                {isToday ? "Heute — " : ""}
                {date.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              <Badge variant="secondary" className="text-xs">{dayEvents.length}</Badge>
            </div>
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <EventCard key={event.id} event={event} onDelete={() => onDelete(event.id)} onEdit={() => onEdit(event)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function WeekView({
  events, month, year, onDelete, onEdit,
}: {
  events: CalendarEvent[]
  month: number; year: number
  onDelete: (id: string) => void
  onEdit: (event: CalendarEvent) => void
}) {
  if (events.length === 0) return <EmptyState month={month} year={year} />

  const weeks = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const date = new Date(localDateKey(e.start_time) + "T12:00:00")
    const ws = new Date(date)
    const day = ws.getDay()
    ws.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
    const key = localDateKey(ws)
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(weeks).map(([weekStart, weekEvents]) => {
        const start = new Date(weekStart + "T12:00:00")
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        return (
          <section key={weekStart} className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-black">
                {start.toLocaleDateString("de-DE", { day: "numeric", month: "short" })} –{" "}
                {end.toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
              </h2>
              <Badge variant="secondary">{weekEvents.length}</Badge>
            </div>
            <div className="space-y-3">
              {weekEvents.map((e) => (
                <EventCard key={e.id} event={e} dense onDelete={() => onDelete(e.id)} onEdit={() => onEdit(e)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function MonthView({
  events, month, year, onDelete, onEdit, onDayClick,
}: {
  events: CalendarEvent[]
  month: number; year: number
  onDelete: (id: string) => void
  onEdit: (event: CalendarEvent) => void
  onDayClick: (year: number, month: number, day: number, events: CalendarEvent[]) => void
}) {
  const firstDay = new Date(year, month, 1).getDay()
  const firstOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const eventsByDay: Record<number, CalendarEvent[]> = {}
  events.forEach((e) => {
    const day = new Date(localDateKey(e.start_time) + "T12:00:00").getDate()
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push(e)
  })

  const cells: (number | null)[] = [
    ...Array(firstOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="space-y-4">
      {/* Mobile list */}
      <div className="space-y-3 md:hidden">
        {events.length === 0 ? (
          <EmptyState month={month} year={year} />
        ) : (
          events.map((e) => (
            <EventCard key={e.id} event={e} onDelete={() => onDelete(e.id)} onEdit={() => onEdit(e)} />
          ))
        )}
      </div>

      {/* Desktop grid */}
      <div className="hidden rounded-xl border bg-card p-2 md:block lg:p-3">
        <div className="mb-2 grid grid-cols-7 gap-1.5 lg:gap-2">
          {WEEKDAYS_SHORT.map((d) => (
            <div key={d} className="px-1 py-1 text-center text-xs font-black text-muted-foreground lg:px-2 lg:text-sm">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 lg:gap-2">
          {cells.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="min-h-[84px] rounded-xl bg-muted/20 lg:min-h-[112px]" />
            const dayEvents = eventsByDay[day] ?? []
            const isToday = isSameDay(new Date(year, month, day), today)
            return (
              <div
                key={day}
                onClick={() => onDayClick(year, month, day, dayEvents)}
                className={cn(
                  "min-h-[84px] cursor-pointer rounded-xl border bg-background p-1.5 transition-colors hover:border-primary/40 lg:min-h-[112px] lg:p-2",
                  dayEvents.length > 0 && "border-primary/30 bg-primary/5",
                  isToday && "border-primary bg-primary/10"
                )}
              >
                <div className="mb-1 flex items-center justify-between lg:mb-2">
                  <span className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-black lg:size-8 lg:text-sm",
                    isToday && "bg-primary text-primary-foreground"
                  )}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-black text-primary-foreground lg:px-2 lg:text-[11px]">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((e, i) => (
                    <div
                      key={e.id}
                      className={cn(
                        "block w-full rounded-md px-1.5 py-1 text-[10px] leading-tight lg:px-2 lg:text-xs",
                        i === 1 && "hidden lg:block",
                        e.status === "erledigt" ? "bg-green-100 text-green-800" : "bg-primary text-primary-foreground"
                      )}
                    >
                      <span className="block truncate font-black">
                        {formatTime(e.start_time)} {e.title.replace(/^\[.*?\]\s*/, "")}
                      </span>
                      {e.projects?.customers?.name && (
                        <span className="hidden truncate opacity-85 lg:block">{e.projects.customers.name}</span>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="rounded-md border px-1.5 py-0.5 text-[10px] font-bold text-primary lg:px-2 lg:text-xs">
                      +{dayEvents.length - 2} weitere
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main client component ─────────────────────────────────────────────────────

export function KalenderClient({ events }: { events: CalendarEvent[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const initial = getInitialMonth(events)

  const [view, setView] = useState<View>("monat")
  const [month, setMonth] = useState(initial.month)
  const [year, setYear] = useState(initial.year)
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null)

  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")
  const [editError, setEditError] = useState("")

  const monthEvents = events.filter((e) => isSameMonth(e.start_time, month, year))
  const activeEvents = monthEvents.filter((e) => e.status !== "abgesagt")
  const doneCount = activeEvents.filter((e) => e.status === "erledigt").length
  const openCount = activeEvents.length - doneCount

  function handleDelete(eventId: string) {
    startTransition(async () => {
      await deleteCalendarEvent(eventId)
      router.refresh()
    })
  }

  function openEdit(event: CalendarEvent) {
    setEditing(event)
    setEditTitle(event.title)
    setEditDate(isoToDate(event.start_time))
    setEditStart(isoToTime(event.start_time))
    setEditEnd(isoToTime(event.end_time))
    setEditError("")
  }

  function handleEditSave() {
    if (!editTitle.trim() || !editing) return
    startTransition(async () => {
      const result = await updateCalendarEvent({
        id: editing.id,
        title: editTitle,
        date: editDate,
        startTime: editStart,
        endTime: editEnd,
      })
      if (result?.error) {
        setEditError(result.error)
      } else {
        setEditing(null)
        router.refresh()
      }
    })
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((v) => v - 1) } else setMonth((v) => v - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((v) => v + 1) } else setMonth((v) => v + 1)
  }

  return (
    <div className="nsh-page">
      <div className="nsh-page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="nsh-eyebrow">
            <span className="nsh-i18n" data-sq="Termine">Termine</span>
          </p>
          <h1 className="nsh-title">
            <span className="nsh-i18n" data-sq="Kalendari">Kalender</span>
          </h1>
          <p className="nsh-subtitle">
            <span className="nsh-i18n" data-sq="Shiko, ndrysho dhe shëno terminet qartë.">Alle Termine klar sehen, ändern und abhaken.</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/neuer-auftrag"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CalendarPlus className="size-4" />
            <span className="nsh-i18n nsh-i18n-button" data-sq="Termin i ri">Neuer Termin</span>
          </Link>
          <div className="flex gap-1 rounded-xl border bg-card p-1">
            {(["monat", "liste", "woche"] as View[]).map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={cn(
                  "min-w-20 rounded-lg px-3 py-2 text-sm font-bold capitalize transition-colors",
                  view === item ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
              >
                <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={item === "monat" ? "muaj" : item === "liste" ? "listë" : "javë"}>{item}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <button onClick={prevMonth} className="flex size-11 items-center justify-center rounded-xl border transition-colors hover:bg-accent" aria-label="Vorheriger Monat">
            <ChevronLeft className="size-5" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black sm:text-2xl">{MONTHS_DE[month]} {year}</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              <span className="nsh-i18n nsh-i18n-center" data-sq={`${activeEvents.length} termine · ${openCount} hapur · ${doneCount} kryer`}>
                {activeEvents.length} Termine · {openCount} offen · {doneCount} erledigt
              </span>
            </p>
          </div>
          <button onClick={nextMonth} className="flex size-11 items-center justify-center rounded-xl border transition-colors hover:bg-accent" aria-label="Nächster Monat">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {view === "monat" && (
        <MonthView
          events={activeEvents}
          month={month}
          year={year}
          onDelete={handleDelete}
          onEdit={openEdit}
          onDayClick={(y, m, d, evts) => setSelectedDay({ year: y, month: m, dayNum: d, events: evts })}
        />
      )}
      {view === "liste" && (
        <ListView events={activeEvents} month={month} year={year} onDelete={handleDelete} onEdit={openEdit} />
      )}
      {view === "woche" && (
        <WeekView events={activeEvents} month={month} year={year} onDelete={handleDelete} onEdit={openEdit} />
      )}

      {/* Day detail sheet */}
      {selectedDay && (
        <DayDetailSheet
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onEdit={(event) => { setSelectedDay(null); openEdit(event) }}
          onDelete={(id) => { handleDelete(id); setSelectedDay(null) }}
          isPending={isPending}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setEditing(null)}
        >
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black">
                  <span className="nsh-i18n" data-sq="Ndrysho termin">Termin ändern</span>
                </h3>
                <button
                  onClick={() => setEditing(null)}
                  className="flex size-9 items-center justify-center rounded-xl hover:bg-accent"
                  aria-label="Schließen / Mbyll"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground"><span className="nsh-i18n" data-sq="Titulli">Titel</span></label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground"><span className="nsh-i18n" data-sq="Data">Datum</span></label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground"><span className="nsh-i18n" data-sq="Nga">Von</span></label>
                  <input
                    type="time"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground"><span className="nsh-i18n" data-sq="Deri">Bis</span></label>
                  <input
                    type="time"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              {editError && <p className="text-sm font-semibold text-destructive">{editError}</p>}
              <div className="flex gap-2">
                <Button size="touch" className="flex-1" onClick={handleEditSave} disabled={isPending}>
                  <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={isPending ? "Duke ruajtur..." : "Ruaj"}>
                    {isPending ? "Speichert..." : "Speichern"}
                  </span>
                </Button>
                <Button size="touch" variant="outline" onClick={() => setEditing(null)}>
                  <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq="Anulo">Abbrechen</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

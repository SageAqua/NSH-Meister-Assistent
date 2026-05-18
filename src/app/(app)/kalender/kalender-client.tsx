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
  "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function isoToDate(iso: string) {
  return iso.split("T")[0]
}

function isoToTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isSameMonth(iso: string, month: number, year: number) {
  const date = new Date(iso)
  return date.getMonth() === month && date.getFullYear() === year
}

function getInitialMonth(events: CalendarEvent[]) {
  const now = new Date()
  const hasCurrentMonthEvents = events.some((event) => isSameMonth(event.start_time, now.getMonth(), now.getFullYear()))
  if (hasCurrentMonthEvents || events.length === 0) return { month: now.getMonth(), year: now.getFullYear() }

  const nowMs = now.getTime()
  const nextEvent = events.find((event) => new Date(event.start_time).getTime() >= nowMs) ?? events[0]
  const date = new Date(nextEvent.start_time)
  return { month: date.getMonth(), year: date.getFullYear() }
}

function getEventLocation(event: CalendarEvent) {
  const customer = event.projects?.customers
  return [customer?.address, customer?.city].filter(Boolean).join(", ")
}

function EmptyState({ month, year }: { month: number; year: number }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center text-muted-foreground">
        <p className="text-lg font-bold text-foreground">Keine Termine im {MONTHS_DE[month]} {year}</p>
        <p className="text-sm">Mit &quot;Neuer Termin&quot; kannst du direkt einen Termin eintragen.</p>
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
        "rounded-lg border border-l-4 bg-card p-4 shadow-sm",
        event.status === "erledigt" ? "border-l-green-500 opacity-75" : "border-l-primary",
        dense && "p-3"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Clock className="size-4" />
            <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
            {event.status === "erledigt" && <Badge variant="secondary" className="text-xs">Erledigt</Badge>}
          </div>
          <h3 className={cn("mt-1 font-black", dense ? "text-base" : "text-lg")}>{event.title}</h3>
          {customer?.name && <p className="text-sm font-semibold text-muted-foreground">{customer.name}</p>}
          {location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs" onClick={onEdit}>
            <Pencil className="size-3.5" /> Aendern
          </Button>
          <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs text-destructive" onClick={onDelete}>
            <Trash2 className="size-3.5" /> Loeschen
          </Button>
          {event.status !== "erledigt" && (
            <form action={markEventDone.bind(null, event.id)}>
              <Button size="sm" type="submit" className="h-9 gap-1.5 bg-green-600 text-xs text-white hover:bg-green-700">
                <CheckCircle2 className="size-3.5" /> Erledigt
              </Button>
            </form>
          )}
          {customer?.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Phone className="size-3.5" /> Anrufen
            </a>
          )}
          {location && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Navigation className="size-3.5" /> Navi
            </a>
          )}
          {project && (
            <Link
              href={`/baustellen/${project.id}`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Building2 className="size-3.5" /> Baustelle
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function ListView({
  events,
  month,
  year,
  onDelete,
  onEdit,
}: {
  events: CalendarEvent[]
  month: number
  year: number
  onDelete: (id: string) => void
  onEdit: (event: CalendarEvent) => void
}) {
  if (events.length === 0) return <EmptyState month={month} year={year} />

  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const day = isoToDate(event.start_time)
    if (!acc[day]) acc[day] = []
    acc[day].push(event)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, dayEvents]) => {
        const date = new Date(day + "T12:00:00")
        const isToday = isSameDay(date, new Date())
        return (
          <section key={day}>
            <div className={cn("mb-3 flex items-center gap-2 rounded-lg px-3 py-2", isToday && "bg-primary/10")}>
              <h2 className={cn("text-base font-black capitalize", isToday && "text-primary")}>
                {isToday ? "Heute - " : ""}
                {date.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              <Badge variant="secondary" className="text-xs">{dayEvents.length}</Badge>
            </div>
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={() => onDelete(event.id)}
                  onEdit={() => onEdit(event)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function WeekView({
  events,
  month,
  year,
  onDelete,
  onEdit,
}: {
  events: CalendarEvent[]
  month: number
  year: number
  onDelete: (id: string) => void
  onEdit: (event: CalendarEvent) => void
}) {
  if (events.length === 0) return <EmptyState month={month} year={year} />

  const weeks = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const date = new Date(event.start_time)
    const weekStart = new Date(date)
    const day = weekStart.getDay()
    weekStart.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
    const key = weekStart.toISOString().split("T")[0]
    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {})

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(weeks).map(([weekStart, weekEvents]) => {
        const start = new Date(weekStart + "T12:00:00")
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        return (
          <section key={weekStart} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-black">
                {start.toLocaleDateString("de-DE", { day: "numeric", month: "short" })} -{" "}
                {end.toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
              </h2>
              <Badge variant="secondary">{weekEvents.length}</Badge>
            </div>
            <div className="space-y-3">
              {weekEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  dense
                  onDelete={() => onDelete(event.id)}
                  onEdit={() => onEdit(event)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function MonthView({
  events,
  month,
  year,
  onDelete,
  onEdit,
}: {
  events: CalendarEvent[]
  month: number
  year: number
  onDelete: (id: string) => void
  onEdit: (event: CalendarEvent) => void
}) {
  const firstDay = new Date(year, month, 1).getDay()
  const firstOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const eventsByDay: Record<number, CalendarEvent[]> = {}
  events.forEach((event) => {
    const date = new Date(event.start_time)
    const day = date.getDate()
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push(event)
  })

  const cells: (number | null)[] = [
    ...Array(firstOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {events.length === 0 ? (
          <EmptyState month={month} year={year} />
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={() => onDelete(event.id)}
              onEdit={() => onEdit(event)}
            />
          ))
        )}
      </div>

      <div className="hidden rounded-lg border bg-card p-2 md:block lg:p-3">
        <div className="mb-2 grid grid-cols-7 gap-1.5 lg:gap-2">
          {WEEKDAYS_SHORT.map((day) => (
            <div key={day} className="px-1 py-1 text-xs font-black text-muted-foreground lg:px-2 lg:text-sm">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 lg:gap-2">
          {cells.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="min-h-[84px] rounded-lg bg-muted/20 lg:min-h-[112px]" />
            const dayEvents = eventsByDay[day] ?? []
            const isToday = isSameDay(new Date(year, month, day), today)
            return (
              <div
                key={day}
                className={cn(
                  "min-h-[84px] rounded-lg border bg-background p-1.5 lg:min-h-[112px] lg:p-2",
                  dayEvents.length > 0 && "border-primary/40 bg-primary/5",
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
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onEdit(event)}
                      className={cn(
                        "block w-full rounded-md px-1.5 py-1 text-left text-[10px] leading-tight lg:px-2 lg:text-xs",
                        eventIndex === 1 && "hidden lg:block",
                        event.status === "erledigt" ? "bg-green-100 text-green-800" : "bg-primary text-primary-foreground"
                      )}
                    >
                      <span className="block truncate font-black">{formatTime(event.start_time)} {event.title}</span>
                      {event.projects?.customers?.name && (
                        <span className="hidden truncate opacity-85 lg:block">{event.projects.customers.name}</span>
                      )}
                    </button>
                  ))}
                  {dayEvents.length > 1 && (
                    <p className="rounded-md border px-1.5 py-0.5 text-[10px] font-bold text-primary lg:px-2 lg:text-xs">
                      +{dayEvents.length - 1} weitere
                    </p>
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

export function KalenderClient({ events }: { events: CalendarEvent[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const initial = getInitialMonth(events)

  const [view, setView] = useState<View>("monat")
  const [month, setMonth] = useState(initial.month)
  const [year, setYear] = useState(initial.year)

  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")
  const [editError, setEditError] = useState("")

  const monthEvents = events.filter((event) => isSameMonth(event.start_time, month, year))
  const activeEvents = monthEvents.filter((event) => event.status !== "abgesagt")
  const doneCount = activeEvents.filter((event) => event.status === "erledigt").length
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
    if (month === 0) { setMonth(11); setYear((value) => value - 1) } else setMonth((value) => value - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((value) => value + 1) } else setMonth((value) => value + 1)
  }

  return (
    <div className="nsh-page">
      <div className="nsh-page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="nsh-eyebrow">Termine</p>
          <h1 className="nsh-title">Kalender</h1>
          <p className="nsh-subtitle">
            Alle Termine im Monat klar sehen, aendern und abhaken.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/heute?new-event=1&type=arbeit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CalendarPlus className="size-4" /> Neuer Termin
          </Link>
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {(["monat", "liste", "woche"] as View[]).map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={cn(
                  "min-w-20 rounded-md px-3 py-2 text-sm font-bold capitalize transition-colors",
                  view === item ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <button onClick={prevMonth} className="flex size-11 items-center justify-center rounded-lg border hover:bg-accent" aria-label="Vorheriger Monat">
            <ChevronLeft className="size-5" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black sm:text-2xl">{MONTHS_DE[month]} {year}</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              {activeEvents.length} Termine, {openCount} offen, {doneCount} erledigt
            </p>
          </div>
          <button onClick={nextMonth} className="flex size-11 items-center justify-center rounded-lg border hover:bg-accent" aria-label="Naechster Monat">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {view === "monat" && (
        <MonthView events={activeEvents} month={month} year={year} onDelete={handleDelete} onEdit={openEdit} />
      )}
      {view === "liste" && (
        <ListView events={activeEvents} month={month} year={year} onDelete={handleDelete} onEdit={openEdit} />
      )}
      {view === "woche" && (
        <WeekView events={activeEvents} month={month} year={year} onDelete={handleDelete} onEdit={openEdit} />
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setEditing(null)}
        >
          <Card className="w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black">Termin aendern</h3>
                <button
                  onClick={() => setEditing(null)}
                  className="flex size-9 items-center justify-center rounded-lg hover:bg-accent"
                  aria-label="Schliessen"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">Titel</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">Datum</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(event) => setEditDate(event.target.value)}
                  className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground">Von</label>
                  <input
                    type="time"
                    value={editStart}
                    onChange={(event) => setEditStart(event.target.value)}
                    className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground">Bis</label>
                  <input
                    type="time"
                    value={editEnd}
                    onChange={(event) => setEditEnd(event.target.value)}
                    className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              {editError && <p className="text-sm font-semibold text-destructive">{editError}</p>}
              <div className="flex gap-2">
                <Button size="touch" className="flex-1" onClick={handleEditSave} disabled={isPending}>
                  {isPending ? "Speichert..." : "Speichern"}
                </Button>
                <Button size="touch" variant="outline" onClick={() => setEditing(null)}>
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

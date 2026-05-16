"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Building2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SwipeToReveal } from "@/components/swipe-to-reveal"
import {
  markEventDone,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/app/actions/orders"
import type { CalendarEvent } from "@/types"
import { cn } from "@/lib/utils"

type View = "liste" | "woche" | "monat"

const WEEKDAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
const MONTHS_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function isoToDate(iso: string) { return iso.split("T")[0] }
function isoToTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function EventRow({
  event,
  onDelete,
  onEdit,
}: {
  event: CalendarEvent
  onDelete: () => void
  onEdit: () => void
}) {
  const customer = event.projects?.customers
  const project = event.projects
  const locationStr = [customer?.address, customer?.city].filter(Boolean).join(", ")

  return (
    <SwipeToReveal onDelete={onDelete} onEdit={onEdit} className="rounded-xl">
      <div
        className={cn(
          "rounded-xl border-l-4 p-4 bg-card space-y-2",
          event.status === "erledigt" ? "border-l-green-500 opacity-70" : "border-l-primary"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">
                {formatTime(event.start_time)} – {formatTime(event.end_time)}
              </span>
              {event.status === "erledigt" && (
                <Badge variant="secondary" className="text-xs">Erledigt</Badge>
              )}
            </div>
            <h4 className="mt-1 font-bold text-base">{event.title}</h4>
            {customer && <p className="text-sm text-muted-foreground">{customer.name}</p>}
          </div>
        </div>

        {locationStr && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {locationStr}
          </div>
        )}

        {event.status !== "erledigt" && (
          <div className="flex flex-wrap gap-2">
            {customer?.phone && (
              <a href={`tel:${customer.phone}`}>
                <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs">
                  <Phone className="size-3.5" /> Anrufen
                </Button>
              </a>
            )}
            {locationStr && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(locationStr)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs">
                  <Navigation className="size-3.5" /> Navigation
                </Button>
              </a>
            )}
            {project && (
              <Link href={`/baustellen/${project.id}`}>
                <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs">
                  <Building2 className="size-3.5" /> Baustelle
                </Button>
              </Link>
            )}
            <form action={markEventDone.bind(null, event.id)}>
              <Button size="sm" type="submit" className="h-9 gap-1.5 bg-green-600 text-xs text-white hover:bg-green-700">
                <CheckCircle2 className="size-3.5" /> Erledigt
              </Button>
            </form>
          </div>
        )}
      </div>
    </SwipeToReveal>
  )
}

function ListView({
  events,
  onDelete,
  onEdit,
}: {
  events: CalendarEvent[]
  onDelete: (id: string) => void
  onEdit: (event: CalendarEvent) => void
}) {
  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg">Keine Termine geplant.</p>
          <p className="text-sm">Nuk ka termine të planifikuara.</p>
        </CardContent>
      </Card>
    )
  }

  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const day = e.start_time.split("T")[0]
    if (!acc[day]) acc[day] = []
    acc[day].push(e)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([day, dayEvents]) => {
        const date = new Date(day + "T12:00:00")
        const isToday = isSameDay(date, new Date())
        return (
          <div key={day}>
            <div className={cn("mb-2 flex items-center gap-2 rounded-lg px-3 py-1.5", isToday && "bg-primary/10")}>
              <span className={cn("text-sm font-bold capitalize", isToday && "text-primary")}>
                {isToday ? "Heute · " : ""}
                {date.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <Badge variant="secondary" className="text-xs">{dayEvents.length}</Badge>
            </div>
            <div className="space-y-2">
              {dayEvents.map((e) => (
                <EventRow
                  key={e.id}
                  event={e}
                  onDelete={() => onDelete(e.id)}
                  onEdit={() => onEdit(e)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthView({ events, month, year }: { events: CalendarEvent[]; month: number; year: number }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const eventsByDay: Record<number, CalendarEvent[]> = {}
  events.forEach((e) => {
    const d = new Date(e.start_time)
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate()
      if (!eventsByDay[day]) eventsByDay[day] = []
      eventsByDay[day].push(e)
    }
  })

  return (
    <div>
      <div className="grid grid-cols-7 text-center mb-1">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="py-1 text-xs font-semibold text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-background aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const isToday = isSameDay(new Date(year, month, day), today)
          const dayEvents = eventsByDay[day] ?? []
          return (
            <div
              key={day}
              className={cn("bg-background p-1 text-center", isToday && "bg-primary/10")}
            >
              <span className={cn(
                "flex size-7 mx-auto items-center justify-center rounded-full text-sm",
                isToday && "bg-primary text-primary-foreground font-bold"
              )}>
                {day}
              </span>
              {dayEvents.slice(0, 2).map((e, j) => (
                <div
                  key={j}
                  className={cn(
                    "mt-0.5 rounded text-[9px] px-1 truncate",
                    e.status === "erledigt" ? "bg-green-100 text-green-700" : "bg-primary/20 text-primary"
                  )}
                >
                  {formatTime(e.start_time)}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-[9px] text-muted-foreground">+{dayEvents.length - 2}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function KalenderClient({ events }: { events: CalendarEvent[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [view, setView] = useState<View>("liste")
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  // Edit modal state
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")
  const [editError, setEditError] = useState("")

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
    if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1)
  }

  const monthEvents = events.filter((e) => {
    const d = new Date(e.start_time)
    return d.getMonth() === month && d.getFullYear() === year
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kalender</h1>
        <div className="flex gap-1 rounded-xl border p-1">
          {(["liste", "woche", "monat"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                view === v ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="flex size-9 items-center justify-center rounded-lg hover:bg-accent">
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold">{MONTHS_DE[month]} {year}</h2>
        <button onClick={nextMonth} className="flex size-9 items-center justify-center rounded-lg hover:bg-accent">
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Content */}
      {view === "monat" ? (
        <MonthView events={events} month={month} year={year} />
      ) : (
        <ListView
          events={view === "liste" ? events : monthEvents}
          onDelete={handleDelete}
          onEdit={openEdit}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
          onClick={() => setEditing(null)}
        >
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Termin ändern / Ndrysho terminin</h3>
                <button
                  onClick={() => setEditing(null)}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-accent"
                >
                  <X className="size-4" />
                </button>
              </div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
              />
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Datum</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Von</label>
                  <input
                    type="time"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Bis</label>
                  <input
                    type="time"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <div className="flex gap-2">
                <Button
                  size="touch"
                  className="flex-1"
                  onClick={handleEditSave}
                  disabled={isPending}
                >
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

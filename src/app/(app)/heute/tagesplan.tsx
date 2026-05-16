"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, Phone, Navigation, CheckCircle2, CalendarClock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SwipeToReveal } from "@/components/swipe-to-reveal"
import {
  markEventDone,
  saveCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  saveNote,
} from "@/app/actions/orders"
import type { CalendarEvent } from "@/types"

export interface FreeSlot {
  startTime: string
  endTime: string
  durationHours: number
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function isoToDate(iso: string) {
  return iso.split("T")[0]
}

function isoToTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function durLabel(h: number) {
  if (h < 1) return `${Math.round(h * 60)} Min`
  return `${h} Std`
}

export function TagesplanSection({
  events,
  freeSlots,
  today,
  autoOpenForm = false,
}: {
  events: CalendarEvent[]
  freeSlots: FreeSlot[]
  today: string
  autoOpenForm?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Add-event form
  const [formOpen, setFormOpen] = useState(autoOpenForm)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("16:00")
  const [saveError, setSaveError] = useState("")
  const submittingRef = useRef(false)

  // Edit / Verschieben modal
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")
  const [editError, setEditError] = useState("")

  // Inline Notiz form
  const [notizOpen, setNotizOpen] = useState<string | null>(null)
  const [notizText, setNotizText] = useState("")

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number)
    return h * 60 + m
  }

  type TL =
    | { kind: "event"; event: CalendarEvent; sortMin: number }
    | { kind: "free"; slot: FreeSlot; sortMin: number }

  const timeline: TL[] = [
    ...events.map((e) => ({
      kind: "event" as const,
      event: e,
      sortMin: new Date(e.start_time).getHours() * 60 + new Date(e.start_time).getMinutes(),
    })),
    ...freeSlots.map((s) => ({
      kind: "free" as const,
      slot: s,
      sortMin: toMin(s.startTime),
    })),
  ].sort((a, b) => a.sortMin - b.sortMin)

  function openWithSlot(slot: FreeSlot) {
    setStartTime(slot.startTime)
    setEndTime(slot.endTime)
    setFormOpen(true)
  }

  function handleSave() {
    if (!title.trim() || submittingRef.current || isPending) return
    submittingRef.current = true
    startTransition(async () => {
      const result = await saveCalendarEvent({ title, date, startTime, endTime })
      submittingRef.current = false
      if (result?.error) {
        setSaveError(result.error)
      } else {
        setTitle("")
        setFormOpen(false)
        setSaveError("")
        router.refresh()
      }
    })
  }

  function handleMarkDone(eventId: string) {
    startTransition(async () => {
      await markEventDone(eventId)
      router.refresh()
    })
  }

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

  function handleSaveNotiz(projectId: string | null) {
    if (!notizText.trim()) return
    startTransition(async () => {
      await saveNote(notizText, "baustellen", projectId ?? undefined)
      setNotizOpen(null)
      setNotizText("")
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">
          {events.length === 0
            ? "Heute keine Termine"
            : `${events.length} Termin${events.length !== 1 ? "e" : ""} heute`}
        </p>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1 text-xs font-semibold text-primary"
        >
          <Plus className="size-3" /> Termin eintragen
        </button>
      </div>

      {timeline.length === 0 ? (
        <button
          onClick={() => setFormOpen(true)}
          className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 hover:bg-primary/10 transition-colors"
        >
          <p className="text-base font-semibold text-primary">Ganzer Tag frei 🙌</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Tippen um Termin einzutragen</p>
        </button>
      ) : (
        <div className="space-y-2">
          {timeline.map((item) => {
            if (item.kind === "event") {
              const { event } = item
              const customer = event.projects?.customers
              const address = customer?.address ?? event.projects?.address
              const city = customer?.city
              const locationStr = [address, city].filter(Boolean).join(", ")
              const phone = customer?.phone
              const isPrivate = !event.project_id

              const endMin =
                new Date(event.end_time).getHours() * 60 +
                new Date(event.end_time).getMinutes()
              const isPast = endMin < nowMin
              const isNow = item.sortMin <= nowMin && endMin > nowMin

              const subtitle = customer
                ? [customer.name, locationStr].filter(Boolean).join(" · ")
                : locationStr || null

              return (
                <SwipeToReveal
                  key={event.id}
                  onEdit={() => openEdit(event)}
                  onDelete={() => handleDelete(event.id)}
                  className="rounded-xl"
                >
                  <div
                    className={cn(
                      "rounded-xl border bg-card p-4 space-y-3",
                      isNow && "border-primary/40 bg-primary/5",
                      event.status === "erledigt" && "opacity-50",
                      isPast && event.status !== "erledigt" && "opacity-60"
                    )}
                  >
                    {/* Time + status badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-primary">
                        {formatTime(event.start_time)} – {formatTime(event.end_time)}
                      </span>
                      {isNow && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                          Jetzt
                        </span>
                      )}
                      {event.status === "erledigt" && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          ✓ Erledigt
                        </span>
                      )}
                    </div>

                    {/* Title + subtitle */}
                    <div>
                      <p className="font-bold">{event.title}</p>
                      {subtitle && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    {event.status !== "erledigt" && (
                      <div className="flex flex-wrap gap-2">
                        {locationStr && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(locationStr)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="h-9 gap-1.5 text-xs">
                              <Navigation className="size-3.5" /> Navigation
                            </Button>
                          </a>
                        )}
                        {phone && (
                          <a href={`tel:${phone}`}>
                            <Button
                              size="sm"
                              className="h-9 gap-1.5 bg-green-600 text-xs text-white hover:bg-green-700"
                            >
                              <Phone className="size-3.5" /> Anrufen
                            </Button>
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 gap-1.5 text-xs"
                          onClick={() => {
                            setNotizOpen(notizOpen === event.id ? null : event.id)
                            setNotizText("")
                          }}
                        >
                          <FileText className="size-3.5" /> Notiz
                        </Button>
                        {isPrivate ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 gap-1.5 text-xs"
                            onClick={() => openEdit(event)}
                          >
                            <CalendarClock className="size-3.5" /> Verschieben
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-9 gap-1.5 bg-green-600 text-xs text-white hover:bg-green-700"
                            onClick={() => handleMarkDone(event.id)}
                            disabled={isPending}
                          >
                            <CheckCircle2 className="size-3.5" /> Erledigt
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Inline Notiz form */}
                    {notizOpen === event.id && (
                      <div className="space-y-2 border-t pt-3">
                        <textarea
                          value={notizText}
                          onChange={(e) => setNotizText(e.target.value)}
                          placeholder="Notiz eingeben... / Shkruaj shënim..."
                          autoFocus
                          rows={2}
                          className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleSaveNotiz(event.project_id)}
                            disabled={isPending || !notizText.trim()}
                          >
                            Speichern
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              setNotizOpen(null)
                              setNotizText("")
                            }}
                          >
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </SwipeToReveal>
              )
            } else {
              const { slot } = item
              return (
                <button
                  key={`free-${slot.startTime}`}
                  onClick={() => openWithSlot(slot)}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-green-300 bg-green-50 px-4 py-2 text-left transition-colors hover:bg-green-100"
                >
                  <div className="size-2 shrink-0 rounded-full bg-green-400" />
                  <p className="flex-1 text-xs font-semibold text-green-700">
                    {slot.startTime} – {slot.endTime} frei · {durLabel(slot.durationHours)}
                  </p>
                  <span className="shrink-0 text-xs font-semibold text-green-600">+ Termin</span>
                </button>
              )
            }
          })}
        </div>
      )}

      {/* Add event form */}
      {formOpen && (
        <Card className="border-primary/30">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Neuer Termin / Termin i ri</h3>
              <button
                onClick={() => setFormOpen(false)}
                className="flex size-8 items-center justify-center rounded-full hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Was? (z.B. Vinyl verlegen, Müller)"
              autoFocus
              className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
            />
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Von</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Bis</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            <div className="flex gap-2">
              <Button
                size="touch"
                className="flex-1"
                onClick={handleSave}
                disabled={isPending || !title.trim()}
              >
                {isPending ? "Speichert..." : "Speichern"}
              </Button>
              <Button size="touch" variant="outline" onClick={() => setFormOpen(false)}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit / Verschieben modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
          onClick={() => setEditing(null)}
        >
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Termin verschieben / Shtyj terminin</h3>
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

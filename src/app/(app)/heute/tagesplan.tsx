"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BriefcaseBusiness, Building2, CalendarClock, CheckCircle2, FileText, Navigation, Phone, Plus, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DaySchedulePreview } from "@/components/day-schedule-preview"
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
  initialEventType = "arbeit",
  compact = false,
}: {
  events: CalendarEvent[]
  freeSlots: FreeSlot[]
  today: string
  autoOpenForm?: boolean
  initialEventType?: "privat" | "arbeit" | "baustelle"
  compact?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Add-event form
  const [formOpen, setFormOpen] = useState(autoOpenForm)
  const [title, setTitle] = useState(autoOpenForm ? getDefaultTitle(initialEventType) : "")
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("16:00")
  const [saveError, setSaveError] = useState("")
  const [eventType, setEventType] = useState<"privat" | "arbeit" | "baustelle">("arbeit")
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

  function openWithSlot(slot: FreeSlot, type: "privat" | "arbeit" | "baustelle" = "arbeit") {
    setStartTime(slot.startTime)
    setEndTime(slot.endTime)
    setEventType(type)
    setFormOpen(true)
  }

  function getDefaultTitle(type: "privat" | "arbeit" | "baustelle") {
    if (type === "privat") return "Privat Termin / Termin privat"
    if (type === "baustelle") return "Baustelle planen / Planifiko kantierin"
    return "Arbeitstermin / Termin pune"
  }

  function getEventVisual(type: "privat" | "arbeit" | "baustelle") {
    if (type === "privat") return { badge: "Privat / Privat", dot: "bg-violet-500", card: "border-violet-300 bg-violet-50", text: "text-violet-800" }
    if (type === "baustelle") return { badge: "Baustelle / Kantier", dot: "bg-amber-500", card: "border-amber-300 bg-amber-50", text: "text-amber-800" }
    return { badge: "Arbeit / Punë", dot: "bg-blue-500", card: "border-blue-300 bg-blue-50", text: "text-blue-800" }
  }

  function detectEventType(event: CalendarEvent): "privat" | "arbeit" | "baustelle" {
    const normalized = event.title.toLowerCase()
    if (normalized.includes("[privat]")) return "privat"
    if (normalized.includes("[baustelle]") || event.project_id) return "baustelle"
    if (normalized.includes("[arbeit]")) return "arbeit"
    return event.project_id ? "baustelle" : "arbeit"
  }

  function handleSave() {
    if (!title.trim() || submittingRef.current || isPending) return
    submittingRef.current = true
    startTransition(async () => {
      const prefixedTitle = `[${eventType}] ${title}`
      const result = await saveCalendarEvent({ title: prefixedTitle, date, startTime, endTime })
      submittingRef.current = false
      if (result?.error) {
        setSaveError(result.error)
      } else {
        setTitle("")
        setFormOpen(false)
        setEventType("arbeit")
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
      {!compact && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {events.length === 0
                ? "Heute keine Termine"
                : `${events.length} Termin${events.length !== 1 ? "e" : ""} heute`}
            </p>
            <button
              onClick={() => {
                setEventType("arbeit")
                setTitle(getDefaultTitle("arbeit"))
                setFormOpen(true)
              }}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              <Plus className="size-3" /> Termin eintragen
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              { key: "privat" as const, label: "Privat", icon: User, type: "privat" as const },
              { key: "arbeit" as const, label: "Work", icon: BriefcaseBusiness, type: "arbeit" as const },
              { key: "baustelle" as const, label: "Baustelle", icon: Building2, type: "baustelle" as const },
            ]).map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setEventType(option.type)
                    setTitle(getDefaultTitle(option.type))
                    setFormOpen(true)
                  }}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border bg-white px-2 py-2.5 text-xs font-semibold transition-colors hover:bg-accent"
                >
                  <Icon className="size-4" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {timeline.length === 0 ? (
        compact ? (
          <Link
            href="/neuer-auftrag"
            className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 hover:bg-primary/10 transition-colors"
          >
            <p className="text-base font-semibold text-primary">
              <span className="nsh-i18n nsh-i18n-center" data-sq="Gjithë dita e lirë 🙌">Ganzer Tag frei 🙌</span>
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <span className="nsh-i18n nsh-i18n-center" data-sq="Shtyp për të regjistruar termin">Tippen um Termin einzutragen</span>
            </p>
          </Link>
        ) : (
          <button
            onClick={() => {
              setEventType("arbeit")
              setTitle(getDefaultTitle("arbeit"))
              setFormOpen(true)
            }}
            className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 hover:bg-primary/10 transition-colors"
          >
            <p className="text-base font-semibold text-primary">
              <span className="nsh-i18n nsh-i18n-center" data-sq="Gjithë dita e lirë 🙌">Ganzer Tag frei 🙌</span>
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <span className="nsh-i18n nsh-i18n-center" data-sq="Shtyp për të regjistruar termin">Tippen um Termin einzutragen</span>
            </p>
          </button>
        )
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
              const eventTypeDetected = detectEventType(event)
              const eventVisual = getEventVisual(eventTypeDetected)

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
                      eventVisual.card,
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
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{event.title.replace(/^\[(privat|arbeit|baustelle)\]\s*/i, "")}</p>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", eventVisual.text, "bg-white/80")}>{eventVisual.badge}</span>
                      </div>
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
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-9 gap-1.5 text-xs"
                          onClick={() => {
                            setNotizOpen(notizOpen === event.id ? null : event.id)
                            setNotizText("")
                          }}
                        >
                          <FileText className="size-3.5" />
                          <span className="nsh-i18n nsh-i18n-button" data-sq="Shënim">Notiz</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-9 gap-1.5 text-xs"
                          onClick={() => openEdit(event)}
                        >
                          <CalendarClock className="size-3.5" />
                          <span className="nsh-i18n nsh-i18n-button" data-sq="Shtyje">Verschieben</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 gap-1.5 bg-green-600 text-xs text-white hover:bg-green-700"
                          onClick={() => handleMarkDone(event.id)}
                          disabled={isPending}
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span className="nsh-i18n nsh-i18n-button" data-sq="Kryer">Erledigt</span>
                        </Button>
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
              const slotContent = (
                <>
                  <div className="size-2 shrink-0 rounded-full bg-green-400" />
                  <p className="flex-1 text-xs font-semibold text-green-700">
                    {slot.startTime} – {slot.endTime} frei · {durLabel(slot.durationHours)}
                  </p>
                  <span className="shrink-0 text-xs font-semibold text-green-600">
                    <span className="nsh-i18n" data-sq="+ Termin">+ Termin</span>
                  </span>
                </>
              )
              return compact ? (
                <Link
                  key={`free-${slot.startTime}`}
                  href="/neuer-auftrag"
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-green-300 bg-green-50 px-4 py-2 text-left transition-colors hover:bg-green-100"
                >
                  {slotContent}
                </Link>
              ) : (
                <button
                  key={`free-${slot.startTime}`}
                  onClick={() => openWithSlot(slot, "arbeit")}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-green-300 bg-green-50 px-4 py-2 text-left transition-colors hover:bg-green-100"
                >
                  {slotContent}
                </button>
              )
            }
          })}
        </div>
      )}

      {/* Add event form */}
      {!compact && formOpen && (
        <Card className="border-primary/30">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold">
                <span className="nsh-i18n" data-sq="Termin i ri">Neuer Termin</span>
              </h3>
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
              className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
            />
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground"><span className="nsh-i18n" data-sq="Data">Datum</span></label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
              />
            </div>
            <DaySchedulePreview date={date} startTime={startTime} endTime={endTime} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground"><span className="nsh-i18n" data-sq="Nga">Von</span></label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground"><span className="nsh-i18n" data-sq="Deri">Bis</span></label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["privat", "arbeit", "baustelle"] as const).map((type) => {
                const visual = getEventVisual(type)
                const active = eventType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    className={cn(
                      "rounded-xl border px-2 py-2 text-xs font-semibold transition-colors",
                      active ? `${visual.card} ${visual.text}` : "bg-white hover:bg-accent"
                    )}
                  >
                    {type === "privat" ? "Privat" : type === "arbeit" ? "Work" : "Baustelle"}
                  </button>
                )
              })}
            </div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            <div className="grid grid-cols-[1fr_auto] gap-2">
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
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold">
                  <span className="nsh-i18n" data-sq="Shtyj terminin">Termin verschieben</span>
                </h3>
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
                className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
              />
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground"><span className="nsh-i18n" data-sq="Data">Datum</span></label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground"><span className="nsh-i18n" data-sq="Nga">Von</span></label>
                  <input
                    type="time"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground"><span className="nsh-i18n" data-sq="Deri">Bis</span></label>
                  <input
                    type="time"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <div className="grid grid-cols-[1fr_auto] gap-2">
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

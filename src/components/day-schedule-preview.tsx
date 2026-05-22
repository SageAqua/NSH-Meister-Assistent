"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { getCalendarEventsForDate } from "@/app/actions/orders"
import { formatLocalTime } from "@/lib/datetime"
import type { CalendarEvent } from "@/types"

type Props = {
  date: string
  startTime?: string
  endTime?: string
  className?: string
}

function formatTime(iso: string) {
  return formatLocalTime(iso)
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return hours * 60 + minutes
}

function eventMinutes(event: CalendarEvent) {
  return {
    start: timeToMinutes(formatLocalTime(event.start_time)) ?? 0,
    end: timeToMinutes(formatLocalTime(event.end_time)) ?? 0,
  }
}

function cleanTitle(title: string) {
  return title.replace(/^\[.*?\]\s*/, "")
}

function typeLabel(title: string, projectId: string | null) {
  const normalized = title.toLowerCase()
  if (normalized.includes("[privat]")) return { de: "Privat", sq: "Privat", cls: "bg-violet-100 text-violet-800" }
  if (normalized.includes("[baustelle]") || projectId) return { de: "Baustelle", sq: "Kantier", cls: "bg-amber-100 text-amber-800" }
  return { de: "Work", sq: "Punë", cls: "bg-blue-100 text-blue-800" }
}

function busyHours(events: CalendarEvent[]) {
  const ranges = events
    .map(eventMinutes)
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start)

  const merged: { start: number; end: number }[] = []
  for (const range of ranges) {
    const last = merged[merged.length - 1]
    if (!last || range.start > last.end) {
      merged.push({ ...range })
    } else {
      last.end = Math.max(last.end, range.end)
    }
  }

  const minutes = merged.reduce((sum, range) => sum + range.end - range.start, 0)
  return Math.round((minutes / 60) * 10) / 10
}

export function DaySchedulePreview({ date, startTime, endTime, className }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    async function loadEvents() {
      if (!date) {
        if (!ignore) setEvents([])
        return
      }

      if (!ignore) {
        setLoading(true)
        setError("")
      }

      try {
        const result = await getCalendarEventsForDate(date)
        if (ignore) return
        if (result.error) {
          setError(result.error)
          setEvents([])
        } else {
          setEvents(result.events ?? [])
        }
      } catch {
        if (!ignore) {
          setError("Termine konnten nicht geladen werden.")
          setEvents([])
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadEvents()

    return () => {
      ignore = true
    }
  }, [date])

  const selectedRange = useMemo(() => {
    if (!startTime || !endTime) return null
    const start = timeToMinutes(startTime)
    const end = timeToMinutes(endTime)
    if (start === null || end === null || end <= start) return null
    return { start, end }
  }, [startTime, endTime])

  const hasOverlap = useMemo(() => {
    if (!selectedRange) return false
    return events.some((event) => {
      const range = eventMinutes(event)
      return selectedRange.start < range.end && selectedRange.end > range.start
    })
  }, [events, selectedRange])

  const dateLabel = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })
    : ""
  const hours = busyHours(events)

  return (
    <section className={`rounded-xl border bg-card p-4 ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-black">
            <CalendarDays className="size-4 text-primary" />
            <span className="nsh-i18n" data-sq="Plani i kësaj dite">Plan an diesem Tag</span>
          </p>
          {dateLabel && <p className="mt-0.5 text-xs font-semibold text-muted-foreground capitalize">{dateLabel}</p>}
        </div>
        {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="mt-3">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
            <span className="nsh-i18n" data-sq="Terminet nuk mund të ngarkohen.">{error}</span>
          </p>
        ) : loading ? (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            <span className="nsh-i18n" data-sq="Terminet po ngarkohen...">Termine werden geladen...</span>
          </p>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-800">
            <span className="nsh-i18n" data-sq="Nuk ka termine. Dita duket e lirë.">Keine Termine. Der Tag sieht frei aus.</span>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm font-semibold text-muted-foreground">
            <span
              className="nsh-i18n"
              data-sq={`${events.length} termine · rreth ${hours.toLocaleString("de-DE")} orë të zëna`}
            >
              {events.length} Termin{events.length !== 1 ? "e" : ""} · ca. {hours.toLocaleString("de-DE")} Std belegt
            </span>
          </div>
        )}

        {selectedRange && !loading && !error && (
          <div className={`mt-2 flex gap-2 rounded-lg px-3 py-2 text-sm font-bold ${hasOverlap ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
            {hasOverlap ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
            <span
              className="nsh-i18n"
              data-sq={hasOverlap ? "Kjo orë përplaset me një termin tjetër." : "Kjo orë duket e lirë."}
            >
              {hasOverlap ? "Diese Uhrzeit überschneidet sich mit einem Termin." : "Diese Uhrzeit sieht frei aus."}
            </span>
          </div>
        )}
      </div>

      {events.length > 0 && !loading && (
        <div className="mt-3 space-y-2">
          {events.map((event) => {
            const customer = event.projects?.customers
            const location = [customer?.address ?? event.projects?.address, customer?.city].filter(Boolean).join(", ")
            const badge = typeLabel(event.title, event.project_id)

            return (
              <div key={event.id} className="rounded-lg border bg-background px-3 py-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                  <span className={`rounded-full px-2 py-0.5 ${badge.cls}`}>
                    <span className="nsh-i18n" data-sq={badge.sq}>{badge.de}</span>
                  </span>
                </div>
                <p className="mt-1 text-sm font-black">{cleanTitle(event.title)}</p>
                {(customer?.name || location) && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[customer?.name, location].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

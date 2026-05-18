"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type MonthlyCalendarEvent = {
  id: string
  date: string
  startTime: string
  endTime: string
  title: string
  customer?: string | null
  status?: string
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function prevMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number)
  if (m === 1) return `${y - 1}-12`
  return `${y}-${String(m - 1).padStart(2, "0")}`
}

function nextMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number)
  if (m === 12) return `${y + 1}-01`
  return `${y}-${String(m + 1).padStart(2, "0")}`
}

export function MonthlyCalendar({
  monthEventsMap,
  today,
}: {
  monthEventsMap: Record<string, MonthlyCalendarEvent[]>
  today: string
}) {
  const todayMonthKey = today.slice(0, 7)
  const [viewedKey, setViewedKey] = useState(todayMonthKey)

  const [yearStr, monthStr] = viewedKey.split("-")
  const year = parseInt(yearStr)
  const monthIdx = parseInt(monthStr) - 1

  const [todayYear, todayMonthStr, todayDayStr] = today.split("-")
  const todayMonthIdx = parseInt(todayMonthStr) - 1
  const todayDay = parseInt(todayDayStr)

  const daysInMonth = getDaysInMonth(year, monthIdx)
  const firstOffset = getFirstDayOfWeek(year, monthIdx)

  const visibleEvents = monthEventsMap[viewedKey] ?? []
  const eventsByDate = visibleEvents.reduce<Record<string, MonthlyCalendarEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = []
    acc[event.date].push(event)
    return acc
  }, {})

  const monthLabel = new Date(year, monthIdx, 1).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  })

  const cells: (number | null)[] = [
    ...Array(firstOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setViewedKey(prevMonthKey(viewedKey))}
          className="flex size-10 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="text-center">
          <p className="text-lg font-black capitalize">{monthLabel}</p>
          <p className="text-xs font-semibold text-muted-foreground">
            {visibleEvents.length === 1 ? "1 Termin" : `${visibleEvents.length} Termine`}
          </p>
        </div>
        <button
          onClick={() => setViewedKey(nextMonthKey(viewedKey))}
          className="flex size-10 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
          aria-label="Naechster Monat"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div>
        <div className="mb-1 grid grid-cols-7 gap-1">
          {weekdays.map((d) => (
            <div key={d} className="px-1 py-1 text-center text-xs font-bold text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="min-h-16 rounded-lg bg-muted/20 sm:min-h-20 lg:min-h-24" />
            const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, "0")}`
            const isToday =
              year === parseInt(todayYear) &&
              monthIdx === todayMonthIdx &&
              day === todayDay
            const isPast =
              !isToday &&
              (year < parseInt(todayYear) ||
                (year === parseInt(todayYear) && monthIdx < todayMonthIdx) ||
                (year === parseInt(todayYear) && monthIdx === todayMonthIdx && day < todayDay))
            const dayEvents = eventsByDate[dateStr] ?? []

            return (
              <div
                key={dateStr}
                className={cn(
                  "min-h-16 rounded-lg border bg-background p-1.5 sm:min-h-20 lg:min-h-24 lg:p-2",
                  dayEvents.length > 0 && "border-primary/30 bg-primary/5",
                  isToday && "border-primary bg-primary/10",
                  isPast && dayEvents.length === 0 && "text-muted-foreground/50"
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-sm font-bold",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-left text-[10px] leading-tight lg:px-2 lg:text-xs",
                        event.status === "erledigt"
                          ? "bg-green-100 text-green-800"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <p className="font-bold truncate">
                        {event.startTime} {event.title}
                      </p>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <Link
                      href="/kalender"
                      className="block rounded-md border px-1.5 py-0.5 text-[10px] font-bold text-primary lg:px-2"
                    >
                      +{dayEvents.length - 2}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Link
        href="/kalender"
        className="mt-3 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-accent"
      >
        <CalendarDays className="size-4" />
        Ganzen Kalender anzeigen
      </Link>
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Mon=0 … Sun=6
}

export function MonthlyCalendar({
  monthEventsMap,
  today,
}: {
  monthEventsMap: Record<string, string[]>
  today: string
}) {
  const monthKeys = Object.keys(monthEventsMap).sort()
  const todayMonthKey = today.slice(0, 7)
  const initialKey = monthKeys.includes(todayMonthKey) ? todayMonthKey : monthKeys[0]
  const [viewedKey, setViewedKey] = useState(initialKey)

  const [yearStr, monthStr] = viewedKey.split("-")
  const year = parseInt(yearStr)
  const monthIdx = parseInt(monthStr) - 1

  const [todayYear, todayMonthStr, todayDayStr] = today.split("-")
  const todayMonthIdx = parseInt(todayMonthStr) - 1
  const todayDay = parseInt(todayDayStr)

  const daysInMonth = getDaysInMonth(year, monthIdx)
  const firstOffset = getFirstDayOfWeek(year, monthIdx)

  const eventSet = new Set(monthEventsMap[viewedKey] ?? [])

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
  const idx = monthKeys.indexOf(viewedKey)

  return (
    <div className="rounded-xl border bg-card p-3">
      {/* Navigation header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setViewedKey(monthKeys[idx - 1])}
          disabled={idx === 0}
          className="flex size-8 items-center justify-center rounded-full hover:bg-accent disabled:opacity-30 transition-colors"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="font-bold capitalize">{monthLabel}</span>
        <button
          onClick={() => setViewedKey(monthKeys[idx + 1])}
          disabled={idx === monthKeys.length - 1}
          className="flex size-8 items-center justify-center rounded-full hover:bg-accent disabled:opacity-30 transition-colors"
          aria-label="Nächster Monat"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
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
          const hasEvent = eventSet.has(dateStr)

          return (
            <div
              key={dateStr}
              className={cn(
                "relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-sm font-medium select-none",
                isToday
                  ? "bg-primary text-primary-foreground font-bold"
                  : isPast
                  ? "text-muted-foreground/40"
                  : "hover:bg-accent"
              )}
            >
              {day}
              {hasEvent && (
                <span
                  className={cn(
                    "absolute bottom-0.5 h-1 w-1 rounded-full",
                    isToday ? "bg-primary-foreground/70" : "bg-primary"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

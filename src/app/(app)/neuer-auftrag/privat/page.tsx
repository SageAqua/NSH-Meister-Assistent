"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { saveCalendarEvent } from "@/app/actions/orders"
import { DaySchedulePreview } from "@/components/day-schedule-preview"

const PRESETS = [
  { label: "Morgens", sq: "Në mëngjes", sub: "08:00 – 10:00", start: "08:00", end: "10:00" },
  { label: "Mittag", sq: "Në drekë", sub: "12:00 – 14:00", start: "12:00", end: "14:00" },
  { label: "Nachmittag", sq: "Pasdite", sub: "14:00 – 17:00", start: "14:00", end: "17:00" },
  { label: "Abend", sq: "Në mbrëmje", sub: "18:00 – 20:00", start: "18:00", end: "20:00" },
]

function todayStr() {
  const d = new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-")
}

export default function PrivatTerminPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const titleRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [date, setDate] = useState(todayStr())
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("10:00")
  const [selectedPreset, setSelectedPreset] = useState<string | null>("Morgens")
  const [error, setError] = useState<string | null>(null)

  function applyPreset(preset: typeof PRESETS[0]) {
    setSelectedPreset(preset.label)
    setStartTime(preset.start)
    setEndTime(preset.end)
  }

  function handleSave() {
    if (!title.trim()) {
      setError("Bitte gib einen Titel ein.")
      titleRef.current?.focus()
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await saveCalendarEvent({
        title: `[privat] ${title.trim()}`,
        date,
        startTime,
        endTime,
      })
      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/heute")
        router.refresh()
      }
    })
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div className="p-4 pb-52 sm:p-6 sm:pb-44">
        <div className="mx-auto max-w-xl">
          <Link
            href="/neuer-auftrag"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="nsh-i18n" data-sq="Mbrapa">Zurück</span>
          </Link>

          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-violet-600">
              <span className="nsh-i18n" data-sq="Termin privat">Privat Termin</span>
            </p>
            <h1 className="mt-1 text-3xl font-black">
              <span className="nsh-i18n" data-sq="Çfarë termini është?">Was ist der Termin?</span>
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-black text-muted-foreground"><span className="nsh-i18n" data-sq="ÇFARË?">WAS?</span></label>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Arzttermin, Familie besuchen..."
                autoFocus
                className="h-14 min-w-0 w-full rounded-xl border-2 border-violet-200 bg-violet-50 px-4 text-base font-bold placeholder:font-normal placeholder:text-muted-foreground focus:border-violet-500 focus:bg-white focus:outline-none sm:h-16 sm:text-xl"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-muted-foreground"><span className="nsh-i18n" data-sq="KUR?">WANN?</span></label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 min-w-0 w-full max-w-full appearance-none rounded-xl border-2 bg-card px-3 text-base font-black focus:border-violet-500 focus:outline-none sm:h-14 sm:px-4 sm:text-lg"
              />
            </div>

            <DaySchedulePreview date={date} startTime={startTime} endTime={endTime} />

            <div>
              <label className="mb-2 block text-sm font-black text-muted-foreground"><span className="nsh-i18n" data-sq="NË ÇFARË ORE?">UM WIEVIEL UHR?</span></label>
              <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`h-14 min-w-0 rounded-xl border-2 px-3 text-left transition-colors sm:h-16 sm:px-4 ${
                      selectedPreset === p.label
                        ? "border-violet-500 bg-violet-100 text-violet-900"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-black sm:text-base"><span className="nsh-i18n" data-sq={p.sq}>{p.label}</span></p>
                    <p className="text-[11px] text-muted-foreground sm:text-xs">{p.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-muted-foreground"><span className="nsh-i18n" data-sq="ORA E SAKTË (opsionale)">GENAUE UHRZEIT (optional)</span></label>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 sm:gap-3">
                <div className="min-w-0">
                  <p className="mb-1 text-xs text-muted-foreground"><span className="nsh-i18n" data-sq="Nga">Von</span></p>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => { setStartTime(e.target.value); setSelectedPreset(null) }}
                    className="h-12 min-w-0 w-full max-w-full appearance-none rounded-xl border-2 bg-card px-3 text-base font-black focus:border-violet-500 focus:outline-none sm:h-14 sm:text-lg"
                  />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs text-muted-foreground"><span className="nsh-i18n" data-sq="Deri">Bis</span></p>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => { setEndTime(e.target.value); setSelectedPreset(null) }}
                    className="h-12 min-w-0 w-full max-w-full appearance-none rounded-xl border-2 bg-card px-3 text-base font-black focus:border-violet-500 focus:outline-none sm:h-14 sm:text-lg"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-bold text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 border-t bg-background/95 p-3 backdrop-blur md:sticky md:bottom-auto md:border-t-0 md:bg-transparent md:px-6 md:pb-6 md:backdrop-blur-none">
        <div className="mx-auto max-w-xl">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="nsh-tap flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-base font-black text-white shadow-lg shadow-violet-500/25 transition-colors hover:bg-violet-700 disabled:opacity-60 sm:h-14 sm:text-lg"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Check className="size-5" />
            )}
            <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={isPending ? "Duke ruajtur..." : "Ruaj termin"}>
              {isPending ? "Wird gespeichert..." : "Termin speichern"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

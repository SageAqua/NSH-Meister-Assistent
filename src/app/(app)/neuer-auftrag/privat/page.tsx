"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { saveCalendarEvent } from "@/app/actions/orders"

const PRESETS = [
  { label: "Morgens", sub: "08:00 – 10:00", start: "08:00", end: "10:00" },
  { label: "Mittag", sub: "12:00 – 14:00", start: "12:00", end: "14:00" },
  { label: "Nachmittag", sub: "14:00 – 17:00", start: "14:00", end: "17:00" },
  { label: "Abend", sub: "18:00 – 20:00", start: "18:00", end: "20:00" },
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
        startIso: new Date(`${date}T${startTime}:00`).toISOString(),
        endIso: new Date(`${date}T${endTime}:00`).toISOString(),
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
    <div className="flex flex-col">
      <div className="p-4 pb-36 sm:p-6">
        <div className="mx-auto max-w-xl">
          <Link
            href="/neuer-auftrag"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Zurueck
          </Link>

          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-violet-600">Privat Termin</p>
            <h1 className="mt-1 text-3xl font-black">Was ist der Termin?</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-black text-muted-foreground">WAS?</label>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Arzttermin, Familie besuchen..."
                autoFocus
                className="h-16 w-full rounded-xl border-2 border-violet-200 bg-violet-50 px-4 text-xl font-bold placeholder:font-normal placeholder:text-muted-foreground focus:border-violet-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-muted-foreground">WANN?</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-16 w-full rounded-xl border-2 bg-card px-4 text-xl font-bold focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-muted-foreground">UM WIEVIEL UHR?</label>
              <div className="grid grid-cols-2 gap-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`h-16 rounded-xl border-2 px-4 text-left transition-colors ${
                      selectedPreset === p.label
                        ? "border-violet-500 bg-violet-100 text-violet-900"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <p className="text-base font-black">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-muted-foreground">GENAUE UHRZEIT (optional)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Von</p>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => { setStartTime(e.target.value); setSelectedPreset(null) }}
                    className="h-14 w-full rounded-xl border-2 bg-card px-3 text-lg font-bold focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Bis</p>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => { setEndTime(e.target.value); setSelectedPreset(null) }}
                    className="h-14 w-full rounded-xl border-2 bg-card px-3 text-lg font-bold focus:border-violet-500 focus:outline-none"
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

      <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur md:sticky md:bottom-auto md:border-t-0 md:bg-transparent md:px-6 md:pb-6 md:backdrop-blur-none">
        <div className="mx-auto max-w-xl">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="nsh-tap flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-violet-600 text-xl font-black text-white shadow-lg shadow-violet-500/25 transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <Check className="size-6" />
            )}
            {isPending ? "Wird gespeichert..." : "Termin speichern"}
          </button>
        </div>
      </div>
    </div>
  )
}

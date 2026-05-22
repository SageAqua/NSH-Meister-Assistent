"use client"

import { useState, useEffect, useRef } from "react"
import { Pause, Square, Play } from "lucide-react"

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function TimeTracker() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  function reset() {
    setRunning(false)
    setSeconds(0)
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-primary px-4 py-5 text-primary-foreground">
      <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-8 -left-4 size-32 rounded-full bg-white/5" />
      <p className="relative z-10 text-xs font-black uppercase tracking-widest text-primary-foreground/70">
        Zeit Tracker
      </p>
      <p className="relative z-10 mt-3 font-mono text-4xl font-black tabular-nums tracking-tight">
        {pad(hours)}:{pad(mins)}:{pad(secs)}
      </p>
      <div className="relative z-10 mt-5 flex gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex size-10 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <button
          onClick={reset}
          className="flex size-10 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
        >
          <Square className="size-4" />
        </button>
      </div>
    </div>
  )
}

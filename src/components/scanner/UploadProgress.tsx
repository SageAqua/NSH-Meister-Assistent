"use client"

import { CheckCircle2, Loader2 } from "lucide-react"

const STEPS = [
  "Dokument wird vorbereitet...",
  "PDF wird erstellt...",
  "Wird hochgeladen...",
  "Fertig ✓",
]

export function UploadProgress({ step, detail }: { step: number; detail?: string }) {
  const isDone = step >= STEPS.length - 1

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10" aria-live="polite">
      {isDone ? (
        <CheckCircle2 className="size-16 text-green-500" />
      ) : (
        <Loader2 className="size-16 animate-spin text-primary" />
      )}
      {detail && <p className="max-w-full truncate text-sm font-bold text-muted-foreground">{detail}</p>}
      <div className="w-full space-y-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              i < step ? "text-muted-foreground line-through" :
              i === step ? "bg-primary/10 text-primary" :
              "text-muted-foreground/40"
            }`}
          >
            {i < step ? (
              <CheckCircle2 className="size-4 shrink-0 text-green-500" />
            ) : i === step && !isDone ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
            ) : i === step && isDone ? (
              <CheckCircle2 className="size-4 shrink-0 text-green-500" />
            ) : (
              <span className="size-4 shrink-0" />
            )}
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

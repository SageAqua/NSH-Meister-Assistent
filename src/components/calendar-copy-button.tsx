"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CalendarCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
    >
      {copied ? (
        <>
          <Check className="size-4" /> Link kopiert!
        </>
      ) : (
        <>
          <Copy className="size-4" /> Link kopieren
        </>
      )}
    </button>
  )
}

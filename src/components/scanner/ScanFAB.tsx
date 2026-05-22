"use client"

import { useState } from "react"
import { ScanLine } from "lucide-react"
import { DocumentScannerSheet } from "./DocumentScannerSheet"

export function ScanFAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if ("vibrate" in navigator) navigator.vibrate(10)
          setOpen(true)
        }}
        aria-label="Dokument scannen"
        className="fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8 md:size-16"
      >
        <ScanLine className="size-6" />
      </button>

      <DocumentScannerSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}

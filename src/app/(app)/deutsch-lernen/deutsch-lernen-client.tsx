"use client"

import { useState } from "react"
import { BookOpen, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { DictionaryTerm } from "@/types"
import { cn } from "@/lib/utils"

const SECTIONS: Record<string, { label: string; sq: string }> = {
  baustelle: { label: "Baustelle", sq: "Kantier" },
  kunden: { label: "Kunde sprechen", sq: "Klienti" },
  preise: { label: "Preise erklären", sq: "Çmimet" },
  termine: { label: "Termine", sq: "Takimet" },
  material: { label: "Material", sq: "Materiali" },
  probleme: { label: "Probleme", sq: "Problemet" },
}

function FlashCard({ term }: { term: DictionaryTerm }) {
  const [copied, setCopied] = useState(false)
  const [whatsapp, setWhatsapp] = useState(false)

  function copyDE() {
    const text = term.example_de ?? term.german
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function sendWhatsApp() {
    const text = `${term.german}\n${term.albanian}${term.example_de ? `\n\n${term.example_de}` : ""}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
    setWhatsapp(true)
    setTimeout(() => setWhatsapp(false), 2000)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4 sm:p-6">
        {/* German */}
        <div className="rounded-2xl bg-primary/10 p-5 text-center">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Deutsch</p>
          <p className="text-xl font-bold text-foreground leading-snug">{term.german}</p>
          {term.example_de && (
            <p className="mt-3 text-sm text-muted-foreground italic">„{term.example_de}"</p>
          )}
        </div>

        {/* Albanian */}
        <div className="rounded-2xl bg-muted p-5 text-center">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Shqip (Albanisch)</p>
          <p className="text-xl font-bold leading-snug">{term.albanian}</p>
          {term.example_al && (
            <p className="mt-3 text-sm text-muted-foreground italic">„{term.example_al}"</p>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button size="touch" variant="outline" className="flex-1 gap-2" onClick={copyDE}>
            {copied ? <><Check className="size-4" /> Kopiert!</> : <><Copy className="size-4" /> Kopieren</>}
          </Button>
          <Button size="touch" variant="outline" className="flex-1 gap-2" onClick={sendWhatsApp}>
            {whatsapp ? "Geöffnet!" : "💬 WhatsApp"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function DeutschLernenClient({ terms }: { terms: DictionaryTerm[] }) {
  const [section, setSection] = useState<string>("kunden")
  const [cardIndex, setCardIndex] = useState(0)
  const [mode, setMode] = useState<"section" | "cards">("section")

  const sectionTerms = terms.filter((t) => t.section === section)
  const currentCard = sectionTerms[cardIndex]

  function openSection(s: string) {
    setSection(s)
    setCardIndex(0)
    setMode("cards")
  }

  function prev() {
    setCardIndex((i) => Math.max(0, i - 1))
  }

  function next() {
    if (cardIndex < sectionTerms.length - 1) setCardIndex((i) => i + 1)
    else setMode("section")
  }

  if (mode === "cards" && currentCard) {
    return (
      <div className="w-full max-w-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setMode("section")} className="flex size-10 items-center justify-center rounded-full hover:bg-accent">
            <ChevronLeft className="size-5" />
          </button>
          <div>
            <h2 className="font-bold text-lg">{SECTIONS[section]?.label ?? section}</h2>
            <p className="text-sm text-muted-foreground">
              {cardIndex + 1} / {sectionTerms.length}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1">
          {sectionTerms.map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full", i <= cardIndex ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        <FlashCard term={currentCard} />

        {/* Navigation */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <Button size="touch" variant="outline" onClick={prev} disabled={cardIndex === 0} className="flex-1 gap-2">
            <ChevronLeft className="size-5" /> Zurück
          </Button>
          <Button size="touch" onClick={next} className="flex-1 gap-2">
            {cardIndex === sectionTerms.length - 1 ? "Fertig ✓" : "Weiter"}
            {cardIndex < sectionTerms.length - 1 && <ChevronRight className="size-5" />}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
          <BookOpen className="size-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Deutsch lernen</h1>
          <p className="text-sm text-muted-foreground">Mëso Gjermanisht</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        {Object.entries(SECTIONS).map(([key, { label, sq }]) => {
          const count = terms.filter((t) => t.section === key).length
          return (
            <button
              key={key}
              onClick={() => openSection(key)}
              className="flex min-h-[100px] flex-col items-start gap-2 rounded-2xl border-2 border-border p-4 text-left transition-all hover:border-primary hover:bg-accent"
            >
              <p className="text-base font-bold">{label}</p>
              <p className="text-xs text-muted-foreground">{sq}</p>
              <p className="text-sm font-semibold text-primary">{count} Karten</p>
            </button>
          )
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-primary mb-1">Wichtigster Satz / Fraza më e rëndësishme:</p>
          <p className="text-base font-bold">
            „Der genaue Preis kann erst nach Besichtigung bestätigt werden."
          </p>
          <p className="text-sm text-muted-foreground mt-1 italic">
            „Çmimi i saktë mund të konfirmohet vetëm pas shikimit të objektit."
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

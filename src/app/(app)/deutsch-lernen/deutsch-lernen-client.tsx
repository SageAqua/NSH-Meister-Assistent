"use client"

import { useState } from "react"
import { BookOpen, ChevronLeft, ChevronRight, Copy, Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { DictionaryTerm } from "@/types"
import { cn } from "@/lib/utils"

const SECTIONS: Record<string, { label: string; sq: string }> = {
  baustelle: { label: "Baustelle", sq: "Kantier" },
  kunden: { label: "Kunde sprechen", sq: "Klienti" },
  preise: { label: "Preise erklären", sq: "Cmimet" },
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
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="rounded-lg bg-primary/10 p-5 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="nsh-i18n nsh-i18n-center" data-sq="Gjermanisht">Deutsch</span>
          </p>
          <p className="text-xl font-bold leading-snug text-foreground">{term.german}</p>
          {term.example_de && (
            <p className="mt-3 text-sm italic text-muted-foreground">{`"${term.example_de}"`}</p>
          )}
        </div>

        <div className="rounded-lg bg-muted p-5 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="nsh-i18n nsh-i18n-center" data-sq="Shqip">Albanisch</span>
          </p>
          <p className="text-xl font-bold leading-snug">{term.albanian}</p>
          {term.example_al && (
            <p className="mt-3 text-sm italic text-muted-foreground">{`"${term.example_al}"`}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button size="touch" variant="outline" className="flex-1 gap-2" onClick={copyDE}>
            {copied ? <><Check className="size-4" /> <span className="nsh-i18n nsh-i18n-button" data-sq="U kopjua!">Kopiert!</span></> : <><Copy className="size-4" /> <span className="nsh-i18n nsh-i18n-button" data-sq="Kopjo">Kopieren</span></>}
          </Button>
          <Button size="touch" variant="outline" className="flex-1 gap-2" onClick={sendWhatsApp}>
            {whatsapp ? <><Check className="size-4" /> <span className="nsh-i18n nsh-i18n-button" data-sq="U hap!">Geöffnet!</span></> : <><MessageCircle className="size-4" /> <span className="nsh-i18n nsh-i18n-button" data-sq="WhatsApp">WhatsApp</span></>}
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

  const sectionTerms = terms.filter((term) => term.section === section)
  const currentCard = sectionTerms[cardIndex]

  function openSection(nextSection: string) {
    setSection(nextSection)
    setCardIndex(0)
    setMode("cards")
  }

  function prev() {
    setCardIndex((index) => Math.max(0, index - 1))
  }

  function next() {
    if (cardIndex < sectionTerms.length - 1) setCardIndex((index) => index + 1)
    else setMode("section")
  }

  if (mode === "cards" && currentCard) {
    return (
      <div className="nsh-page max-w-4xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode("section")} className="flex size-10 items-center justify-center rounded-lg hover:bg-accent">
            <ChevronLeft className="size-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold">
              <span className="nsh-i18n" data-sq={SECTIONS[section]?.sq ?? section}>{SECTIONS[section]?.label ?? section}</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              {cardIndex + 1} / {sectionTerms.length}
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          {sectionTerms.map((_, index) => (
            <div key={index} className={cn("h-1 flex-1 rounded-full", index <= cardIndex ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        <FlashCard term={currentCard} />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <Button size="touch" variant="outline" onClick={prev} disabled={cardIndex === 0} className="flex-1 gap-2">
            <ChevronLeft className="size-5" />
            <span className="nsh-i18n nsh-i18n-button" data-sq="Mbrapa">Zurück</span>
          </Button>
          <Button size="touch" onClick={next} className="flex-1 gap-2">
            <span className="nsh-i18n nsh-i18n-button" data-sq={cardIndex === sectionTerms.length - 1 ? "Gati" : "Vazhdo"}>
              {cardIndex === sectionTerms.length - 1 ? "Fertig" : "Weiter"}
            </span>
            {cardIndex < sectionTerms.length - 1 && <ChevronRight className="size-5" />}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="nsh-page max-w-5xl">
      <div className="nsh-page-header flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
          <BookOpen className="size-5 text-primary-foreground" />
        </div>
        <div>
          <p className="nsh-eyebrow">
            <span className="nsh-i18n" data-sq="Gjuha">Sprache</span>
          </p>
          <h1 className="nsh-title">
            <span className="nsh-i18n" data-sq="Mëso gjermanisht">Deutsch lernen</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Object.entries(SECTIONS).map(([key, { label, sq }]) => {
          const count = terms.filter((term) => term.section === key).length
          return (
            <button
              key={key}
              onClick={() => openSection(key)}
              className="flex min-h-[100px] flex-col items-start gap-2 rounded-lg border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-accent"
            >
              <p className="text-base font-bold">
                <span className="nsh-i18n" data-sq={sq}>{label}</span>
              </p>
              <p className="text-sm font-semibold text-primary">
                <span className="nsh-i18n" data-sq={`${count} karta`}>{count} Karten</span>
              </p>
            </button>
          )
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="mb-1 text-sm font-semibold text-primary">
            <span className="nsh-i18n" data-sq="Fraza më e rëndësishme:">Wichtigster Satz:</span>
          </p>
          <p className="text-base font-bold">
            &quot;Der genaue Preis kann erst nach Besichtigung bestätigt werden.&quot;
          </p>
          <p className="mt-1 text-sm italic text-muted-foreground">
            &quot;Cmimi i sakte mund te konfirmohet vetem pas shikimit te objektit.&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

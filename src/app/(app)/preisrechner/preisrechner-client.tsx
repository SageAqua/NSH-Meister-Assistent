"use client"

import { useState } from "react"
import { Calculator, Copy, Check, MessageCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SERVICES, CATEGORY_META, calcPrice, calcDuration, buildWhatsAppText } from "@/lib/calculations/pricing"
import type { WorkCategory } from "@/lib/calculations/pricing"
import { savePriceCalculation } from "@/app/actions/orders"

const CATEGORIES: WorkCategory[] = ["maler", "boden", "sonstiges"]

export function PreisrechnerClient() {
  const [category, setCategory] = useState<WorkCategory>("maler")
  const [serviceId, setServiceId] = useState<string>("waende")
  const [area, setArea] = useState<number>(0)
  const [aufwaendig, setAufwaendig] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const servicesForCategory = SERVICES.filter((s) => s.category === category)
  const selectedService =
    SERVICES.find((s) => s.id === serviceId && s.category === category) ??
    servicesForCategory[0] ??
    SERVICES[0]

  const result = area > 0 ? calcPrice(selectedService, area, aufwaendig) : null
  const days = area > 0 ? calcDuration(selectedService, area) : null

  function handleCategoryChange(cat: WorkCategory) {
    setCategory(cat)
    const first = SERVICES.find((s) => s.category === cat)
    if (first) setServiceId(first.id)
  }

  function copyPrice() {
    if (!result) return
    const text = `Preisangebot NSH Renovierung:\n${selectedService.labelDe}, ca. ${area} m²\n• ca. ${result.normal.toLocaleString("de-DE")} € (${result.low.toLocaleString("de-DE")} – ${result.high.toLocaleString("de-DE")} €)\n• Dauer: ca. ${days} Tag${days !== 1 ? "e" : ""}\n\nDer genaue Preis kann erst nach Besichtigung bestätigt werden.`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSave() {
    if (!result) return
    await savePriceCalculation({
      serviceType: selectedService.id,
      areaMm: area,
      difficulty: aufwaendig ? "aufwaendig" : "standard",
      extras: {},
      priceLow: result.low,
      priceNormal: result.normal,
      priceHigh: result.high,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="nsh-page max-w-6xl">
      <div className="nsh-page-header flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
          <Calculator className="size-5 text-primary-foreground" />
        </div>
        <div>
          <p className="nsh-eyebrow">Kalkulation</p>
          <h1 className="nsh-title">Preisrechner</h1>
          <p className="nsh-subtitle">Kalkulatori i cmimeve</p>
        </div>
      </div>

      {/* Step 1: Category */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">1. Kategorie</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat]
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "rounded-2xl border-2 p-4 text-center transition-all",
                  category === cat
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                )}
              >
                <p className="text-2xl">{meta.emoji}</p>
                <p className="mt-1 text-sm font-bold">{meta.labelDe}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2: Service */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">2. Leistung</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {servicesForCategory.map((service) => (
            <button
              key={service.id}
              onClick={() => setServiceId(service.id)}
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-all",
                serviceId === service.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40"
              )}
            >
              <p className="text-sm font-bold leading-tight">{service.labelDe}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{service.rateNormal} €/m²</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Area + difficulty */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">3. Fläche / Siperfaqja</p>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={() => setArea(Math.max(0, area - 5))}
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 text-2xl font-bold hover:border-primary hover:bg-accent"
          >
            −
          </button>
          <input
            type="number"
            min="0"
            value={area || ""}
            onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="h-14 min-w-0 flex-1 rounded-2xl border-2 border-primary bg-background px-3 text-center text-2xl font-black focus:outline-none sm:px-4 sm:text-3xl"
          />
          <span className="text-xl font-bold text-muted-foreground">m²</span>
          <button
            onClick={() => setArea(area + 5)}
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 text-2xl font-bold hover:border-primary hover:bg-accent"
          >
            +
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAufwaendig(false)}
            className={cn(
              "flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all",
              !aufwaendig
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/40"
            )}
          >
            Standard
          </button>
          <button
            onClick={() => setAufwaendig(true)}
            className={cn(
              "flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all",
              aufwaendig
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/40"
            )}
          >
            Aufwändig +25%
          </button>
        </div>
      </div>

      {/* Result — live, updates as area changes */}
      {result ? (
        <Card className="overflow-hidden border-primary/30">
          <div className="bg-primary p-5 text-center text-primary-foreground">
            <p className="text-sm font-medium opacity-80">ca.</p>
            <p className="mt-1 text-3xl font-black sm:text-5xl">{result.normal.toLocaleString("de-DE")} €</p>
            <p className="mt-2 text-base opacity-80">
              {result.low.toLocaleString("de-DE")} – {result.high.toLocaleString("de-DE")} €
            </p>
            {days && (
              <p className="mt-1 text-sm opacity-70">
                ca. {days} Tag{days !== 1 ? "e" : ""} Arbeit
              </p>
            )}
          </div>
          <CardContent className="space-y-2 p-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Preis nach Besichtigung bestätigt / Cmimi konfirmohet pas shikimit
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <a
                href={`https://wa.me/?text=${buildWhatsAppText(selectedService, area, result)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="touch" className="w-full gap-1.5 bg-green-600 text-white hover:bg-green-700">
                  <MessageCircle className="size-4" /> WhatsApp
                </Button>
              </a>
              <Button size="touch" variant="outline" className="gap-1.5" onClick={copyPrice}>
                {copied ? (
                  <><Check className="size-4" /> Kopiert!</>
                ) : (
                  <><Copy className="size-4" /> Kopieren</>
                )}
              </Button>
              <Button size="touch" variant="outline" className="gap-1.5" onClick={handleSave}>
                {saved ? (
                  <><Check className="size-4" /> Gespeichert</>
                ) : (
                  <><Save className="size-4" /> Speichern</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
          <p className="text-4xl">💰</p>
          <p className="mt-2 font-medium">m² eingeben → Preis erscheint sofort</p>
          <p className="mt-1 text-sm">Shkruaj m² → Cmimi shfaqet menjehere</p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Calculator, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SERVICES, CATEGORY_META, UNIT_LABELS, UNIT_LABELS_SQ, calcPrice } from "@/lib/calculations/pricing"
import type { WorkCategory } from "@/lib/calculations/pricing"

const CATEGORIES: WorkCategory[] = ["maler", "boden", "fugen", "leisten", "trockenbau", "sonstiges"]

export function MiniPreisrechner() {
  const [serviceId, setServiceId] = useState<string>("waende")
  const [area, setArea] = useState<number>(0)

  const selected = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0]
  const result = area > 0 ? calcPrice(selected, area, false) : null
  const unit = UNIT_LABELS[selected.unit]
  const unitSq = UNIT_LABELS_SQ[selected.unit]

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="size-4 text-primary" />
            <h3 className="font-bold">
              <span className="nsh-i18n" data-sq="Çmim i shpejtë">Schnell-Preis</span>
            </h3>
          </div>
          <Link href="/preisrechner" className="flex items-center gap-1 text-xs text-primary font-semibold">
            <span className="nsh-i18n" data-sq="I plotë">Vollständig</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
        >
          {CATEGORIES.map((cat) => (
            <optgroup key={cat} label={`${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].labelDe}`}>
              {SERVICES.filter((s) => s.category === cat).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.labelDe} — {s.rateNormal} €/{UNIT_LABELS[s.unit]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setArea(Math.max(0, area - 5))}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 text-xl font-bold hover:border-primary hover:bg-accent"
          >
            −
          </button>
          <input
            type="number"
            min="0"
            value={area || ""}
            onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
            placeholder={unit}
            className="h-11 min-w-0 flex-1 rounded-xl border-2 border-border bg-background px-3 text-center text-xl font-bold focus:border-primary focus:outline-none"
          />
          <button
            onClick={() => setArea(area + 5)}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 text-xl font-bold hover:border-primary hover:bg-accent"
          >
            +
          </button>
        </div>

        {result ? (
          <div className="rounded-xl bg-primary p-3 text-center text-primary-foreground">
            <p className="text-2xl font-black sm:text-3xl">
              <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={`afërsisht ${result.normal.toLocaleString("de-DE")} €`}>ca. {result.normal.toLocaleString("de-DE")} €</span>
            </p>
            <p className="mt-0.5 text-sm opacity-80">
              {result.low.toLocaleString("de-DE")} – {result.high.toLocaleString("de-DE")} €
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-muted/60 p-3 text-center text-sm text-muted-foreground">
            <span className="nsh-i18n nsh-i18n-center" data-sq={`Shkruaj ${unitSq} → çmimi shfaqet menjëherë`}>
              {unit} eingeben → Preis erscheint sofort
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

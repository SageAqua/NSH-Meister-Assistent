"use client"

import { useState, useTransition } from "react"
import { ChevronLeft, ChevronRight, Check, AlertTriangle, Euro, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculatePrice, calculateDuration, getRiskHints, generateCalendarPlan } from "@/lib/calculations/vinyl"
import { saveVinylOrder } from "@/app/actions/orders"
import type { VinylOrderForm, Customer, PriceEstimate, DurationEstimate, CalendarPlanDay } from "@/types"
import { cn } from "@/lib/utils"

const STEPS = [
  "Kunde", "Objekttyp", "Vinyl-Art", "Fläche",
  "Räume", "Untergrund", "Zusatzarbeiten",
  "Material", "Startdatum", "Arbeitszeit"
]

const initialForm: VinylOrderForm = {
  extras: {
    bodenEntfernen: false,
    spachteln: false,
    sockelleisten: false,
    tuerenKuerzen: false,
    moebelRaeumen: false,
    materialHolen: false,
    entsorgung: false,
    endreinigung: false,
  }
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all",
            i < current ? "bg-primary" : i === current ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  )
}

function BigCard({
  title, subtitle, selected, onClick
}: {
  title: string; subtitle?: string; selected?: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-h-[80px] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 p-4 transition-all",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent"
      )}
    >
      <span className="text-base font-bold">{title}</span>
      {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
    </button>
  )
}

// ─── STEP COMPONENTS ───────────────────────────────────────────────────────────

function StepKunde({ form, setForm, customers }: {
  form: VinylOrderForm; setForm: (f: VinylOrderForm) => void; customers: Customer[]
}) {
  const [mode, setMode] = useState<"select" | "new">(form.isNewCustomer ? "new" : "select")

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Welcher Kunde? <span className="text-lg text-muted-foreground font-normal">/ Cili klient?</span></h2>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode("select")}
          className={cn("rounded-xl border-2 p-3 text-sm font-semibold transition-all",
            mode === "select" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50")}
        >
          Bestehender Kunde
        </button>
        <button
          onClick={() => { setMode("new"); setForm({ ...form, isNewCustomer: true, customerId: undefined }) }}
          className={cn("rounded-xl border-2 p-3 text-sm font-semibold transition-all",
            mode === "new" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50")}
        >
          Neuer Kunde
        </button>
      </div>

      {mode === "select" && (
        <div className="space-y-2">
          {customers.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Noch keine Kunden vorhanden.</p>
          )}
          {customers.map((c) => (
            <button
              key={c.id}
              onClick={() => setForm({ ...form, customerId: c.id, customerName: c.name, isNewCustomer: false })}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                form.customerId === c.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.city ?? c.phone ?? ""}</p>
              </div>
              {form.customerId === c.id && <Check className="ml-auto size-5 text-primary" />}
            </button>
          ))}
        </div>
      )}

      {mode === "new" && (
        <div className="space-y-3">
          {[
            { key: "customerName", placeholder: "Name *", type: "text" },
            { key: "customerPhone", placeholder: "Telefon / Telefoni", type: "tel" },
            { key: "customerAddress", placeholder: "Adresse / Adresa", type: "text" },
            { key: "customerCity", placeholder: "Ort / Qyteti", type: "text" },
          ].map(({ key, placeholder, type }) => (
            <input
              key={key}
              type={type}
              placeholder={placeholder}
              value={(form as unknown as Record<string, string | undefined>)[key] ?? ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value, isNewCustomer: true })}
              className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base transition-colors focus:border-primary focus:outline-none"
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StepObjekttyp({ form, setForm }: { form: VinylOrderForm; setForm: (f: VinylOrderForm) => void }) {
  const options = [
    { value: "neubau", de: "Neubau", sq: "Ndërtesë e re" },
    { value: "altbau", de: "Altbau", sq: "Ndërtesë e vjetër" },
    { value: "renovierung", de: "Renovierung bewohnt", sq: "Rinovim i banuar" },
    { value: "gewerbe", de: "Gewerbeobjekt", sq: "Objekt komercial" },
  ] as const

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Objekttyp <span className="text-lg text-muted-foreground font-normal">/ Lloji i objektit</span></h2>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => (
          <BigCard
            key={o.value}
            title={o.de}
            subtitle={o.sq}
            selected={form.objectType === o.value}
            onClick={() => setForm({ ...form, objectType: o.value })}
          />
        ))}
      </div>
    </div>
  )
}

function StepVinylArt({ form, setForm }: { form: VinylOrderForm; setForm: (f: VinylOrderForm) => void }) {
  const options = [
    { value: "klickvinyl", de: "Klickvinyl", sq: "Vinili Click", desc: "28 €/m² Basis" },
    { value: "klebevinyl", de: "Klebevinyl", sq: "Vinili me ngjitës", desc: "35 €/m² Basis" },
    { value: "rigid", de: "Rigid Vinyl", sq: "Vinili Rigid", desc: "32 €/m² Basis" },
    { value: "unknown", de: "Weiß ich noch nicht", sq: "Nuk e di ende", desc: "~30 €/m²" },
  ] as const

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Vinyl-Art <span className="text-lg text-muted-foreground font-normal">/ Lloji i vinilit</span></h2>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => (
          <BigCard
            key={o.value}
            title={o.de}
            subtitle={`${o.sq} · ${o.desc}`}
            selected={form.vinylType === o.value}
            onClick={() => setForm({ ...form, vinylType: o.value })}
          />
        ))}
      </div>
    </div>
  )
}

function StepFlaeche({ form, setForm }: { form: VinylOrderForm; setForm: (f: VinylOrderForm) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Fläche <span className="text-lg text-muted-foreground font-normal">/ Sipërfaqja</span></h2>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setForm({ ...form, area: Math.max(0, (form.area ?? 0) - 5) })}
            className="flex size-14 items-center justify-center rounded-full border-2 border-border bg-card text-2xl font-bold hover:border-primary hover:bg-accent"
          >−</button>
          <div className="flex items-end gap-2">
            <input
              type="number"
              min="0"
              max="9999"
              value={form.area ?? ""}
              onChange={(e) => setForm({ ...form, area: parseFloat(e.target.value) || 0 })}
              className="w-32 rounded-2xl border-2 border-primary bg-background py-3 text-center text-4xl font-black focus:outline-none"
            />
            <span className="pb-3 text-2xl font-bold text-muted-foreground">m²</span>
          </div>
          <button
            onClick={() => setForm({ ...form, area: (form.area ?? 0) + 5 })}
            className="flex size-14 items-center justify-center rounded-full border-2 border-border bg-card text-2xl font-bold hover:border-primary hover:bg-accent"
          >+</button>
        </div>
        <p className="text-muted-foreground">Gesamtfläche eingeben / Vendos sipërfaqen totale</p>
        {(form.area ?? 0) > 0 && (
          <Badge variant="secondary" className="text-sm">
            ca. {Math.ceil((form.area ?? 0) / 20)} Arbeitstage alleine
          </Badge>
        )}
      </div>
    </div>
  )
}

function StepRaeume({ form, setForm }: { form: VinylOrderForm; setForm: (f: VinylOrderForm) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Räume <span className="text-lg text-muted-foreground font-normal">/ Dhomat</span></h2>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setForm({ ...form, rooms: Math.max(1, (form.rooms ?? 1) - 1) })}
            className="flex size-14 items-center justify-center rounded-full border-2 border-border text-2xl font-bold hover:border-primary hover:bg-accent"
          >−</button>
          <span className="w-16 text-center text-5xl font-black">{form.rooms ?? 1}</span>
          <button
            onClick={() => setForm({ ...form, rooms: (form.rooms ?? 1) + 1 })}
            className="flex size-14 items-center justify-center rounded-full border-2 border-border text-2xl font-bold hover:border-primary hover:bg-accent"
          >+</button>
        </div>
        <p className="text-lg text-muted-foreground">Anzahl der Räume / Numri i dhomave</p>
      </div>
    </div>
  )
}

function StepUntergrund({ form, setForm }: { form: VinylOrderForm; setForm: (f: VinylOrderForm) => void }) {
  const options = [
    { value: "gut", de: "Gut", sq: "Mirë", desc: "Eben, keine Risse" },
    { value: "mittel", de: "Mittel", sq: "Mesatare", desc: "Leichte Unebenheiten" },
    { value: "schlecht", de: "Schlecht", sq: "Keq", desc: "Risse, Feuchte mögl." },
    { value: "unbekannt", de: "Unbekannt", sq: "I panjohur", desc: "Erst bei Besichtigung" },
  ] as const

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Untergrund <span className="text-lg text-muted-foreground font-normal">/ Baza</span></h2>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => (
          <BigCard
            key={o.value}
            title={o.de}
            subtitle={`${o.sq} · ${o.desc}`}
            selected={form.groundCondition === o.value}
            onClick={() => setForm({ ...form, groundCondition: o.value })}
          />
        ))}
      </div>
    </div>
  )
}

function StepZusatzarbeiten({ form, setForm }: { form: VinylOrderForm; setForm: (f: VinylOrderForm) => void }) {
  const options = [
    { key: "bodenEntfernen" as const, de: "Boden entfernen", sq: "Heqja e dyshemesë", price: "8 €/m²" },
    { key: "spachteln" as const, de: "Spachteln", sq: "Shpëtim me suva", price: "12 €/m²" },
    { key: "sockelleisten" as const, de: "Sockelleisten", sq: "Bordura", price: "2 €/m²" },
    { key: "tuerenKuerzen" as const, de: "Türen kürzen", sq: "Shkurtim dyersh", price: "80 €/Stk" },
    { key: "moebelRaeumen" as const, de: "Möbel räumen", sq: "Heqja e mobilieve", price: "1,50 €/m²" },
    { key: "materialHolen" as const, de: "Material holen", sq: "Marrja e materialit", price: "60 € fix" },
    { key: "entsorgung" as const, de: "Entsorgung", sq: "Heqja e mbeturinave", price: "3 €/m²" },
    { key: "endreinigung" as const, de: "Endreinigung", sq: "Pastrim final", price: "1,50 €/m²" },
  ]

  const toggle = (key: keyof VinylOrderForm["extras"]) => {
    setForm({ ...form, extras: { ...form.extras, [key]: !form.extras[key] } })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Zusatzarbeiten <span className="text-lg text-muted-foreground font-normal">/ Punë shtesë</span></h2>
      <div className="space-y-2">
        {options.map(({ key, de, sq, price }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
              form.extras[key] ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-all",
              form.extras[key] ? "border-primary bg-primary" : "border-muted-foreground"
            )}>
              {form.extras[key] && <Check className="size-4 text-primary-foreground" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{de}</p>
              <p className="text-sm text-muted-foreground">{sq}</p>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{price}</span>
          </button>
        ))}
      </div>
      {form.extras.tuerenKuerzen && (
        <div className="flex items-center gap-3 rounded-xl bg-accent p-3">
          <span className="text-sm font-medium">Anzahl Türen / Numri i dyerve:</span>
          <input
            type="number"
            min="1"
            value={form.tuerenCount ?? 1}
            onChange={(e) => setForm({ ...form, tuerenCount: parseInt(e.target.value) || 1 })}
            className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}
    </div>
  )
}

function StepMaterial({ form, setForm }: { form: VinylOrderForm; setForm: (f: VinylOrderForm) => void }) {
  const options = [
    { value: "kunde", de: "Kunde hat Material", sq: "Klienti ka material" },
    { value: "nsh", de: "NSH besorgt Material", sq: "NSH siguron material" },
    { value: "unklar", de: "Noch nicht geklärt", sq: "Ende e paqartë" },
  ] as const

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Material <span className="text-lg text-muted-foreground font-normal">/ Materiali</span></h2>
      <div className="space-y-3">
        {options.map((o) => (
          <BigCard
            key={o.value}
            title={o.de}
            subtitle={o.sq}
            selected={form.material === o.value}
            onClick={() => setForm({ ...form, material: o.value })}
          />
        ))}
      </div>
    </div>
  )
}

function StepStartdatum({ form, setForm }: { form: VinylOrderForm; setForm: (f: VinylOrderForm) => void }) {
  const today = new Date().toISOString().split("T")[0]
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Startdatum <span className="text-lg text-muted-foreground font-normal">/ Data e fillimit</span></h2>
      <div className="flex flex-col items-center gap-4">
        <input
          type="date"
          min={today}
          value={form.startDate ?? ""}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="h-14 w-full rounded-2xl border-2 border-primary bg-background px-4 text-lg font-semibold focus:outline-none"
        />
        <div className="grid w-full grid-cols-2 gap-2">
          {[1, 3, 7, 14].map((days) => {
            const d = new Date(); d.setDate(d.getDate() + days)
            const str = d.toISOString().split("T")[0]
            return (
              <button
                key={days}
                onClick={() => setForm({ ...form, startDate: str })}
                className={cn(
                  "rounded-xl border-2 p-3 text-sm font-medium transition-all",
                  form.startDate === str ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                )}
              >
                {days === 1 ? "Morgen" : `In ${days} Tagen`}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StepArbeitszeit({ form, setForm }: { form: VinylOrderForm; setForm: (f: VinylOrderForm) => void }) {
  const options = [
    { value: "08-16", de: "08:00 – 16:00 Uhr" },
    { value: "09-17", de: "09:00 – 17:00 Uhr" },
    { value: "custom", de: "Eigene Zeit" },
  ] as const

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Arbeitszeit <span className="text-lg text-muted-foreground font-normal">/ Orari i punës</span></h2>
      <div className="space-y-3">
        {options.map((o) => (
          <BigCard
            key={o.value}
            title={o.de}
            selected={form.workingHours === o.value}
            onClick={() => setForm({ ...form, workingHours: o.value })}
          />
        ))}
        {form.workingHours === "custom" && (
          <input
            type="text"
            placeholder="z.B. 07-15"
            value={form.workingHoursCustom ?? ""}
            onChange={(e) => setForm({ ...form, workingHoursCustom: e.target.value })}
            className="h-12 w-full rounded-xl border-2 border-primary bg-background px-4 text-base focus:outline-none"
          />
        )}
      </div>
    </div>
  )
}

// ─── RESULT SCREEN ─────────────────────────────────────────────────────────────

function ResultScreen({ form, onBack, onEdit }: {
  form: VinylOrderForm
  onBack: () => void
  onEdit: (step: number) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const price: PriceEstimate = calculatePrice(form)
  const duration: DurationEstimate = calculateDuration(form)
  const risks: string[] = getRiskHints(form)
  const plan: CalendarPlanDay[] = generateCalendarPlan(form)

  const vinylLabels: Record<string, string> = {
    klickvinyl: "Klickvinyl", klebevinyl: "Klebevinyl", rigid: "Rigid Vinyl", unknown: "Unbekannt"
  }
  const conditionLabels: Record<string, string> = {
    gut: "Gut", mittel: "Mittel", schlecht: "Schlecht", unbekannt: "Unbekannt"
  }
  const objectLabels: Record<string, string> = {
    neubau: "Neubau", altbau: "Altbau", renovierung: "Renovierung", gewerbe: "Gewerbe"
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveVinylOrder(form, plan)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full hover:bg-accent">
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-2xl font-bold">Auftrag prüfen / Kontrollo porosinë</h2>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-lg">Zusammenfassung</h3>
          {[
            { label: "Kunde", value: form.customerName ?? "—", step: 0 },
            { label: "Objekttyp", value: objectLabels[form.objectType ?? ""] ?? "—", step: 1 },
            { label: "Vinyl-Art", value: vinylLabels[form.vinylType ?? ""] ?? "—", step: 2 },
            { label: "Fläche", value: `${form.area ?? "—"} m²`, step: 3 },
            { label: "Räume", value: `${form.rooms ?? "—"}`, step: 4 },
            { label: "Untergrund", value: conditionLabels[form.groundCondition ?? ""] ?? "—", step: 5 },
            { label: "Startdatum", value: form.startDate ?? "—", step: 8 },
          ].map(({ label, value, step }) => (
            <div key={label} className="flex items-center justify-between py-1 border-b last:border-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{value}</span>
                <button onClick={() => onEdit(step)} className="text-xs text-primary underline">Ändern</button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Duration */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-5 text-primary" />
            <h3 className="font-bold text-lg">Dauer / Kohëzgjatja</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-3xl font-black text-primary">{duration.alleine}</p>
              <p className="text-sm text-muted-foreground">Tage alleine</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-3xl font-black text-primary">{duration.mitHelfer}</p>
              <p className="text-sm text-muted-foreground">Tage mit Helfer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price */}
      <Card className="border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Euro className="size-5 text-primary" />
            <h3 className="font-bold text-lg">Preisspanne / Gama e çmimeve</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Niedrig", value: price.low },
              { label: "Normal", value: price.normal, highlight: true },
              { label: "Hoch", value: price.high },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={cn("rounded-xl p-3 text-center", highlight ? "bg-primary text-primary-foreground" : "bg-muted/50")}>
                <p className="text-xs font-medium mb-1">{label}</p>
                <p className={cn("text-xl font-black", highlight ? "text-primary-foreground" : "text-primary")}>
                  {value.toLocaleString("de-DE")} €
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
            Basis: {price.breakdown.base} € + Extras: {price.breakdown.extras} €
          </div>
          <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            Çmimi i saktë mund të konfirmohet vetëm pas shikimit të objektit.<br />
            <span className="text-xs">Der genaue Preis kann erst nach Besichtigung bestätigt werden.</span>
          </div>
        </CardContent>
      </Card>

      {/* Risks */}
      {risks.length > 0 && (
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-5 text-orange-500" />
              <h3 className="font-bold text-lg">Risiko-Hinweise</h3>
            </div>
            <div className="space-y-2">
              {risks.map((risk, i) => (
                <div key={i} className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm">{risk}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Plan */}
      {plan.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="size-5 text-primary" />
              <h3 className="font-bold text-lg">Auto-Kalenderplan</h3>
            </div>
            <div className="space-y-2">
              {plan.map((day, i) => (
                <div key={i} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold">{day.title}</p>
                    <Badge variant="secondary" className="text-xs">{day.startTime}–{day.endTime}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {day.tasks.map((task, j) => (
                      <li key={j} className="text-sm flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary inline-block" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Action buttons */}
      <div className="space-y-3 pb-4">
        <Button size="touch-xl" className="w-full" onClick={handleSave} disabled={isPending}>
          {isPending ? "Speichert..." : "✓ Auftrag speichern & Kalender erstellen"}
        </Button>
        <Button size="touch" variant="outline" className="w-full" onClick={onBack}>
          Zurück bearbeiten
        </Button>
      </div>
    </div>
  )
}

// ─── MAIN WIZARD ──────────────────────────────────────────────────────────────

export function VinylWizard({ customers }: { customers: Customer[] }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<VinylOrderForm>(initialForm)
  const [showResult, setShowResult] = useState(false)

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!(form.customerId || (form.isNewCustomer && form.customerName))
      case 1: return !!form.objectType
      case 2: return !!form.vinylType
      case 3: return (form.area ?? 0) > 0
      case 4: return (form.rooms ?? 0) > 0
      case 5: return !!form.groundCondition
      case 6: return true
      case 7: return !!form.material
      case 8: return !!form.startDate
      case 9: return !!form.workingHours
      default: return true
    }
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else setShowResult(true)
  }

  const back = () => {
    if (showResult) { setShowResult(false); return }
    if (step > 0) setStep(step - 1)
  }

  if (showResult) {
    return (
      <ResultScreen
        form={form}
        onBack={() => setShowResult(false)}
        onEdit={(s) => { setShowResult(false); setStep(s) }}
      />
    )
  }

  const stepComponents = [
    <StepKunde key={0} form={form} setForm={setForm} customers={customers} />,
    <StepObjekttyp key={1} form={form} setForm={setForm} />,
    <StepVinylArt key={2} form={form} setForm={setForm} />,
    <StepFlaeche key={3} form={form} setForm={setForm} />,
    <StepRaeume key={4} form={form} setForm={setForm} />,
    <StepUntergrund key={5} form={form} setForm={setForm} />,
    <StepZusatzarbeiten key={6} form={form} setForm={setForm} />,
    <StepMaterial key={7} form={form} setForm={setForm} />,
    <StepStartdatum key={8} form={form} setForm={setForm} />,
    <StepArbeitszeit key={9} form={form} setForm={setForm} />,
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Schritt {step + 1} von {STEPS.length} · Vinyl verlegen
          </p>
          <Badge variant="secondary">{STEPS[step]}</Badge>
        </div>
        <StepIndicator current={step + 1} total={STEPS.length} />
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {stepComponents[step]}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button size="touch" variant="outline" onClick={back} className="flex-1">
            <ChevronLeft className="size-5" /> Zurück
          </Button>
        )}
        <Button
          size="touch"
          onClick={next}
          disabled={!canProceed()}
          className="flex-1"
        >
          {step === STEPS.length - 1 ? "Preis berechnen →" : "Weiter"}
          {step < STEPS.length - 1 && <ChevronRight className="size-5" />}
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  SERVICES,
  WORKER_CONFIGS,
  CATEGORY_META,
  calcPrice,
  calcDaysWithWorkers,
  generateWorkPlan,
} from "@/lib/calculations/pricing"
import type { ServiceItem, WorkerConfig } from "@/lib/calculations/pricing"
import { saveUniversalOrder } from "@/app/actions/orders"
import type { Customer } from "@/types"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3 | 4 | 5

export function UniversalWizard({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<Step>(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [area, setArea] = useState(50)
  const [aufwaendig, setAufwaendig] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<WorkerConfig | null>(null)
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [customerId, setCustomerId] = useState("")
  const [saveError, setSaveError] = useState("")

  const servicesForCategory = selectedCategory
    ? SERVICES.filter((s) => s.category === selectedCategory)
    : []

  const price = selectedService ? calcPrice(selectedService, area, aufwaendig) : null
  const totalDays =
    selectedService && selectedWorker
      ? calcDaysWithWorkers(selectedService, area, selectedWorker.totalWorkers)
      : 0
  const plan =
    selectedService && selectedWorker && startDate
      ? generateWorkPlan(selectedService, area, selectedWorker.totalWorkers, startDate)
      : []

  function adjustArea(delta: number) {
    setArea((a) => Math.max(1, a + delta))
  }

  function handleSave() {
    if (!selectedService || !selectedWorker) return
    startTransition(async () => {
      const result = await saveUniversalOrder({
        serviceId: selectedService.id,
        area,
        unit: selectedService.unit,
        workersCount: selectedWorker.totalWorkers,
        helpersCount: selectedWorker.helpersCount,
        startDate,
        customerId: customerId || undefined,
        plan: plan.map((d) => ({
          date: d.date,
          title: d.title,
          startTime: d.startTime,
          endTime: d.endTime,
        })),
      })
      if (result.error) {
        setSaveError(result.error)
      } else if (result.projectId) {
        router.push(`/baustellen/${result.projectId}`)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-1.5">
        {([1, 2, 3, 4, 5] as Step[]).map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              step >= s ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* ── Step 1: Service ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold">Was wird gemacht?</h2>
            <p className="text-sm text-muted-foreground">Çfarë do të bëhet?</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(CATEGORY_META) as [string, { labelDe: string; labelSq: string; emoji: string }][]).map(
              ([id, meta]) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedCategory(id)
                    setSelectedService(null)
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-all",
                    selectedCategory === id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="text-3xl">{meta.emoji}</span>
                  <span className="text-xs font-bold text-center leading-tight">{meta.labelDe}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{meta.labelSq}</span>
                </button>
              )
            )}
          </div>

          {selectedCategory && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Welche Leistung? / Çfarë shërbimi?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {servicesForCategory.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={cn(
                      "flex flex-col items-start rounded-xl border-2 p-3 text-left transition-all",
                      selectedService?.id === service.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <p className="font-semibold text-sm">{service.labelDe}</p>
                    <p className="text-xs text-muted-foreground">{service.labelSq}</p>
                    <p className="mt-2 text-xs font-bold text-primary">{service.rateNormal} €/m²</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            size="touch"
            className="w-full gap-1"
            disabled={!selectedService}
            onClick={() => setStep(2)}
          >
            Weiter / Vazhdo <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* ── Step 2: Area ── */}
      {step === 2 && selectedService && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold">Wie viele m²?</h2>
            <p className="text-sm text-muted-foreground">Sa m²? — {selectedService.labelDe}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => adjustArea(-20)}
                className="flex h-12 w-14 items-center justify-center rounded-xl border-2 border-border text-base font-bold hover:bg-accent active:bg-accent"
              >
                −20
              </button>
              <button
                onClick={() => adjustArea(-5)}
                className="flex h-12 w-14 items-center justify-center rounded-xl border-2 border-border text-base font-bold hover:bg-accent active:bg-accent"
              >
                −5
              </button>
            </div>

            <input
              type="number"
              value={area}
              onChange={(e) => setArea(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-24 flex-1 rounded-2xl border-2 border-primary bg-primary/5 text-center text-4xl font-black focus:outline-none"
            />

            <div className="flex flex-col gap-2">
              <button
                onClick={() => adjustArea(20)}
                className="flex h-12 w-14 items-center justify-center rounded-xl border-2 border-border text-base font-bold hover:bg-accent active:bg-accent"
              >
                +20
              </button>
              <button
                onClick={() => adjustArea(5)}
                className="flex h-12 w-14 items-center justify-center rounded-xl border-2 border-border text-base font-bold hover:bg-accent active:bg-accent"
              >
                +5
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">m² Quadratmeter</p>

          <div className="flex gap-3">
            <button
              onClick={() => setAufwaendig(false)}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-all",
                !aufwaendig ? "border-primary bg-primary/10 text-primary" : "border-border"
              )}
            >
              Standard
            </button>
            <button
              onClick={() => setAufwaendig(true)}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-all",
                aufwaendig ? "border-primary bg-primary/10 text-primary" : "border-border"
              )}
            >
              Aufwändig +25%
            </button>
          </div>

          {price && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="mb-1 text-xs text-muted-foreground">Geschätzter Preis</p>
              <p className="text-3xl font-black text-primary">
                {price.normal.toLocaleString("de-DE")} €
              </p>
              <p className="text-sm text-muted-foreground">
                {price.low.toLocaleString("de-DE")} – {price.high.toLocaleString("de-DE")} €
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="touch" variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="touch" className="flex-1 gap-1" onClick={() => setStep(3)}>
              Weiter / Vazhdo <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Workers ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold">Wer arbeitet?</h2>
            <p className="text-sm text-muted-foreground">Kush punon?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {WORKER_CONFIGS.map((worker) => (
              <button
                key={worker.id}
                onClick={() => setSelectedWorker(worker)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all",
                  selectedWorker?.id === worker.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span className="text-4xl">{worker.emoji}</span>
                <span className="text-sm font-bold text-center">{worker.label}</span>
                <span className="text-xs text-muted-foreground text-center">{worker.labelSq}</span>
              </button>
            ))}
          </div>

          {selectedService && selectedWorker && (
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Geschätzte Dauer / Kohëzgjatja</p>
              <p className="text-3xl font-black">
                {calcDaysWithWorkers(selectedService, area, selectedWorker.totalWorkers)} Tage
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="touch" variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              size="touch"
              className="flex-1 gap-1"
              disabled={!selectedWorker}
              onClick={() => setStep(4)}
            >
              Weiter / Vazhdo <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Start date + plan ── */}
      {step === 4 && selectedService && selectedWorker && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold">Wann fangen wir an?</h2>
            <p className="text-sm text-muted-foreground">Kur fillojmë?</p>
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-lg focus:border-primary focus:outline-none"
          />

          {plan.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold">
                Arbeitsplan / Plani i punës — {plan.length} Tage
              </p>
              {plan.map((day) => (
                <div key={day.day} className="rounded-xl border bg-card p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      Tag {day.day} —{" "}
                      {new Date(day.date + "T12:00:00").toLocaleDateString("de-DE", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {day.startTime}–{day.endTime}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{day.title}</p>
                  <ul className="mt-1 space-y-0.5">
                    {day.tasksDe.map((t, i) => (
                      <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                        <span>•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button size="touch" variant="outline" onClick={() => setStep(3)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              size="touch"
              className="flex-1 gap-1"
              disabled={!startDate}
              onClick={() => setStep(5)}
            >
              Weiter / Vazhdo <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 5: Customer + summary + save ── */}
      {step === 5 && selectedService && selectedWorker && price && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold">Zusammenfassung</h2>
            <p className="text-sm text-muted-foreground">Përmbledhje</p>
          </div>

          <div className="space-y-2.5 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
            <Row label="Leistung" value={selectedService.labelDe} />
            <Row label="Fläche / Sipërfaqja" value={`${area} m²${aufwaendig ? " (aufwändig)" : ""}`} />
            <Row label="Team" value={selectedWorker.label} />
            <Row label="Dauer / Kohëzgjatja" value={`${totalDays} Tage`} />
            <Row
              label="Start"
              value={new Date(startDate + "T12:00:00").toLocaleDateString("de-DE", {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}
            />
            <div className="border-t border-primary/20 pt-2.5">
              <div className="flex items-end justify-between">
                <span className="text-sm text-muted-foreground">Preis / Çmimi</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">
                    {price.normal.toLocaleString("de-DE")} €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {price.low.toLocaleString("de-DE")} – {price.high.toLocaleString("de-DE")} €
                  </p>
                </div>
              </div>
            </div>
          </div>

          {customers.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Kunde (optional) / Klienti
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-base focus:border-primary focus:outline-none"
              >
                <option value="">Kein Kunde / Pa klient</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {saveError && <p className="text-sm text-destructive">{saveError}</p>}

          <div className="flex gap-2">
            <Button size="touch" variant="outline" onClick={() => setStep(4)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              size="touch"
              className="flex-1 gap-2"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                "Speichert..."
              ) : (
                <>
                  <Check className="size-4" /> Speichern & Kalender
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

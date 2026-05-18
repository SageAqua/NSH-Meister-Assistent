"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  Check,
  ClipboardList,
  Hammer,
  MapPin,
  PackageCheck,
  Phone,
  Save,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DaySchedulePreview } from "@/components/day-schedule-preview"
import { cn } from "@/lib/utils"
import { saveSimpleOrder } from "@/app/actions/orders"
import type { Customer } from "@/types"

const QUICK_WORK = [
  { de: "Vinyl verlegen", sq: "Vendosje vinyl" },
  { de: "Laminat verlegen", sq: "Vendosje laminat" },
  { de: "Wände streichen", sq: "Lyerje muresh" },
  { de: "Decke streichen", sq: "Lyerje tavani" },
  { de: "Spachteln", sq: "Nivelim me masë" },
  { de: "Trockenbau", sq: "Ndërtim i thatë" },
  { de: "Bad renovieren", sq: "Rinovim banjoje" },
  { de: "Reparatur", sq: "Riparim" },
]

type CustomerMode = "existing" | "new" | "later"

function todayKey() {
  return new Date().toISOString().split("T")[0]
}

export function UniversalWizard({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [workTitle, setWorkTitle] = useState("")
  const [customerMode, setCustomerMode] = useState<CustomerMode>(
    customers.length > 0 ? "existing" : "new"
  )
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerCity, setCustomerCity] = useState("")
  const [areaM2, setAreaM2] = useState("")
  const [helpersCount, setHelpersCount] = useState(0)
  const [startDate, setStartDate] = useState(todayKey())
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("16:00")
  const [durationDays, setDurationDays] = useState(1)
  const [workOnWeekends, setWorkOnWeekends] = useState(false)
  const [notes, setNotes] = useState("")
  const [materialNeeded, setMaterialNeeded] = useState(true)
  const [offerNeeded, setOfferNeeded] = useState(true)
  const [error, setError] = useState("")

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerId),
    [customerId, customers]
  )

  const canSave =
    workTitle.trim().length > 1 &&
    (customerMode !== "new" || customerName.trim().length > 1)

  function save() {
    if (!canSave) return
    setError("")

    startTransition(async () => {
      const result = await saveSimpleOrder({
        workTitle,
        customerMode,
        customerId: customerMode === "existing" ? customerId : undefined,
        customerName,
        customerPhone,
        customerAddress,
        customerCity,
        areaM2: areaM2 ? Number(areaM2) : null,
        helpersCount,
        startDate: startDate || undefined,
        startTime,
        endTime,
        durationDays,
        workOnWeekends,
        notes,
        materialNeeded,
        offerNeeded,
      })

      if (result.error) {
        setError(result.error)
      } else if (result.projectId) {
        router.push(`/baustellen/${result.projectId}`)
      }
    })
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Hammer className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black leading-tight">
              <span className="nsh-i18n" data-sq="Çfarë është puna?">Was ist die Arbeit?</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="nsh-i18n" data-sq="Mjafton një fjali. Mund të shkruajë lirshëm.">Ein Satz reicht. Er kann frei schreiben.</span>
            </p>
          </div>
        </div>

        <textarea
          value={workTitle}
          onChange={(event) => setWorkTitle(event.target.value)}
          placeholder="z.B. Küche renovieren, Boden raus, Vinyl rein, Wände streichen"
          rows={3}
          autoFocus
          className="w-full resize-none rounded-lg border-2 border-border bg-background p-4 text-lg font-semibold leading-snug outline-none transition-colors focus:border-primary"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_WORK.map((work) => (
            <button
              key={work.de}
              type="button"
              onClick={() => setWorkTitle(work.de)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-bold transition-colors",
                workTitle === work.de
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              )}
            >
              <span className="nsh-i18n nsh-i18n-button" data-sq={work.sq}>{work.de}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <UserRound className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black leading-tight">
              <span className="nsh-i18n" data-sq="Kush është klienti?">Wer ist der Kunde?</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="nsh-i18n" data-sq="Zgjidh ekzistues, regjistro të ri ose bëje më vonë.">Bestehend wählen, neu eintragen oder später machen.</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { value: "existing" as const, label: "Kunde wählen", sq: "Zgjidh klientin", disabled: customers.length === 0 },
            { value: "new" as const, label: "Neuer Kunde", sq: "Klient i ri" },
            { value: "later" as const, label: "Später", sq: "Më vonë" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => setCustomerMode(option.value)}
              className={cn(
                "min-h-12 rounded-lg border-2 px-3 text-base font-black transition-colors disabled:opacity-40",
                customerMode === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={option.sq}>{option.label}</span>
            </button>
          ))}
        </div>

        {customerMode === "existing" && customers.length > 0 && (
          <div className="mt-3 space-y-3">
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-lg font-semibold outline-none focus:border-primary"
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {selectedCustomer.phone && (
                  <p className="flex items-center gap-2 rounded-lg bg-muted p-3">
                    <Phone className="size-4" /> {selectedCustomer.phone}
                  </p>
                )}
                {(selectedCustomer.address || selectedCustomer.city) && (
                  <p className="flex items-center gap-2 rounded-lg bg-muted p-3">
                    <MapPin className="size-4" />
                    {[selectedCustomer.address, selectedCustomer.city].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {customerMode === "new" && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Name *"
              className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
            <p className="-mt-1 text-xs text-muted-foreground">Emri *</p>
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Telefon"
              type="tel"
              className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
            <p className="-mt-1 text-xs text-muted-foreground">Telefoni</p>
            <input
              value={customerAddress}
              onChange={(event) => setCustomerAddress(event.target.value)}
              placeholder="Adresse"
              className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary sm:col-span-2"
            />
            <p className="-mt-1 text-xs text-muted-foreground sm:col-span-2">Adresa</p>
            <input
              value={customerCity}
              onChange={(event) => setCustomerCity(event.target.value)}
              placeholder="Ort"
              className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
            <p className="-mt-1 text-xs text-muted-foreground">Vendi</p>
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
            <CalendarDays className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black leading-tight">
              <span className="nsh-i18n" data-sq="Kur dhe sa e madhe?">Wann und wie groß?</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="nsh-i18n" data-sq="Plotëso vetëm atë që dihet tashmë.">Nur ausfüllen, was schon bekannt ist.</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-bold uppercase text-muted-foreground"><span className="nsh-i18n" data-sq="Fillimi">Start</span></span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold uppercase text-muted-foreground"><span className="nsh-i18n" data-sq="Nga">Von</span></span>
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold uppercase text-muted-foreground"><span className="nsh-i18n" data-sq="Deri">Bis</span></span>
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-bold uppercase text-muted-foreground"><span className="nsh-i18n" data-sq="Sipërfaqe m²">Fläche m²</span></span>
            <input
              type="number"
              min="0"
              value={areaM2}
              onChange={(event) => setAreaM2(event.target.value)}
              placeholder="z.B. 80"
              className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
          </label>
          <div className="space-y-1 sm:col-span-2">
            <span className="text-xs font-bold uppercase text-muted-foreground"><span className="nsh-i18n" data-sq="Ndihmës">Helfer</span></span>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setHelpersCount(count)}
                  className={cn(
                    "h-14 rounded-lg border-2 text-base font-black",
                    helpersCount === count
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {startDate && (
          <DaySchedulePreview date={startDate} startTime={startTime} endTime={endTime} className="mt-3" />
        )}

        <div className="mt-4 rounded-lg border bg-muted/20 p-3">
          <div className="mb-3">
            <p className="text-sm font-black">
              <span className="nsh-i18n" data-sq="Sa ditë pune?">Wie lange dauert die Baustelle?</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <span className="nsh-i18n" data-sq="Aplikacioni krijon automatikisht ditët e punës.">Die App plant automatisch alle Arbeitstage ein.</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              { value: 1, label: "1 Tag", sq: "1 ditë" },
              { value: 2, label: "2 Tage", sq: "2 ditë" },
              { value: 3, label: "3 Tage", sq: "3 ditë" },
              { value: 5, label: "1 Woche", sq: "1 javë" },
              { value: 10, label: "2 Wochen", sq: "2 javë" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDurationDays(option.value)}
                className={cn(
                  "min-h-12 rounded-lg border-2 px-2 text-sm font-black transition-colors",
                  durationDays === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background"
                )}
              >
                <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={option.sq}>{option.label}</span>
              </button>
            ))}
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
              <span className="nsh-i18n" data-sq="Ditë pune saktë">Eigene Arbeitstage</span>
            </span>
            <input
              type="number"
              min={1}
              max={60}
              value={durationDays}
              onChange={(event) => setDurationDays(Math.max(1, Math.min(60, Number(event.target.value) || 1)))}
              className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base font-black outline-none focus:border-primary"
            />
          </label>

          <label className="mt-3 flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
            <input
              type="checkbox"
              checked={workOnWeekends}
              onChange={(event) => setWorkOnWeekends(event.target.checked)}
              className="size-5 accent-primary"
            />
            <span className="text-sm font-bold">
              <span className="nsh-i18n" data-sq="Planifiko edhe fundjavën">Auch Samstag/Sonntag einplanen</span>
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
            <ClipboardList className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black leading-tight">
              <span className="nsh-i18n" data-sq="Të mbahet mend diçka tjetër?">Noch etwas merken?</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="nsh-i18n" data-sq="Shënim dhe detyra automatike.">Notiz und automatische Aufgaben.</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ToggleButton
            checked={offerNeeded}
            onClick={() => setOfferNeeded((value) => !value)}
            icon={Check}
            label="Angebot schicken"
            labelSq="Dërgo ofertën"
          />
          <ToggleButton
            checked={materialNeeded}
            onClick={() => setMaterialNeeded((value) => !value)}
            icon={PackageCheck}
            label="Material prüfen"
            labelSq="Kontrollo materialin"
          />
        </div>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notiz, Material, Besonderheiten, Kundenwunsch ..."
          rows={4}
          className="mt-3 w-full resize-none rounded-lg border-2 border-border bg-background p-4 text-base outline-none focus:border-primary"
        />
      </section>

      {error && <p className="rounded-lg bg-destructive/10 p-3 font-semibold text-destructive">{error}</p>}

      <div className="sticky bottom-20 z-10 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur md:bottom-4">
        <Button size="touch-xl" className="w-full gap-2" onClick={save} disabled={!canSave || isPending}>
          <Save className="size-5" />
          <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={isPending ? "Duke ruajtur..." : "Ruaj porosinë"}>
            {isPending ? "Speichert..." : "Auftrag speichern"}
          </span>
        </Button>
      </div>
    </div>
  )
}

function ToggleButton({
  checked,
  onClick,
  icon: Icon,
  label,
  labelSq,
}: {
  checked: boolean
  onClick: () => void
  icon: typeof Check
  label: string
  labelSq: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-lg border-2 px-4 text-left font-black transition-colors",
        checked ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md border-2",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
        )}
      >
        {checked && <Icon className="size-4" />}
      </span>
      <span className="nsh-i18n nsh-i18n-button" data-sq={labelSq}>{label}</span>
    </button>
  )
}

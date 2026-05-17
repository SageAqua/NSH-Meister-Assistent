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
import { cn } from "@/lib/utils"
import { saveSimpleOrder } from "@/app/actions/orders"
import type { Customer } from "@/types"

const QUICK_WORK = [
  "Vinyl verlegen",
  "Laminat verlegen",
  "Waende streichen",
  "Decke streichen",
  "Spachteln",
  "Trockenbau",
  "Bad renovieren",
  "Reparatur",
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
            <h2 className="text-xl font-black leading-tight">Was ist die Arbeit?</h2>
            <p className="text-sm text-muted-foreground">Ein Satz reicht. Er kann frei schreiben.</p>
          </div>
        </div>

        <textarea
          value={workTitle}
          onChange={(event) => setWorkTitle(event.target.value)}
          placeholder="z.B. Kueche renovieren, Boden raus, Vinyl rein, Waende streichen"
          rows={3}
          autoFocus
          className="w-full resize-none rounded-lg border-2 border-border bg-background p-4 text-lg font-semibold leading-snug outline-none transition-colors focus:border-primary"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_WORK.map((work) => (
            <button
              key={work}
              type="button"
              onClick={() => setWorkTitle(work)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-bold transition-colors",
                workTitle === work
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              )}
            >
              {work}
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
            <h2 className="text-xl font-black leading-tight">Wer ist der Kunde?</h2>
            <p className="text-sm text-muted-foreground">Bestehend waehlen, neu eintragen oder spaeter machen.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { value: "existing" as const, label: "Kunde waehlen", disabled: customers.length === 0 },
            { value: "new" as const, label: "Neuer Kunde" },
            { value: "later" as const, label: "Spaeter" },
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
              {option.label}
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
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Telefon"
              type="tel"
              className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
            <input
              value={customerAddress}
              onChange={(event) => setCustomerAddress(event.target.value)}
              placeholder="Adresse"
              className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary sm:col-span-2"
            />
            <input
              value={customerCity}
              onChange={(event) => setCustomerCity(event.target.value)}
              placeholder="Ort"
              className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
            <CalendarDays className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black leading-tight">Wann und wie gross?</h2>
            <p className="text-sm text-muted-foreground">Nur ausfuellen, was schon bekannt ist.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">Start</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold uppercase text-muted-foreground">Von</span>
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold uppercase text-muted-foreground">Bis</span>
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">Flaeche m2</span>
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
            <span className="text-xs font-bold uppercase text-muted-foreground">Helfer</span>
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
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
            <ClipboardList className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black leading-tight">Noch etwas merken?</h2>
            <p className="text-sm text-muted-foreground">Notiz und automatische Aufgaben.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ToggleButton
            checked={offerNeeded}
            onClick={() => setOfferNeeded((value) => !value)}
            icon={Check}
            label="Angebot schicken"
          />
          <ToggleButton
            checked={materialNeeded}
            onClick={() => setMaterialNeeded((value) => !value)}
            icon={PackageCheck}
            label="Material pruefen"
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
          {isPending ? "Speichert..." : "Auftrag speichern"}
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
}: {
  checked: boolean
  onClick: () => void
  icon: typeof Check
  label: string
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
      {label}
    </button>
  )
}

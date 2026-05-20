"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Hammer,
  Loader2,
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
  { de: "Waende streichen", sq: "Lyerje muresh" },
  { de: "Decke streichen", sq: "Lyerje tavani" },
  { de: "Spachteln", sq: "Nivelim" },
  { de: "Trockenbau", sq: "Ndertim i thate" },
  { de: "Bad renovieren", sq: "Rinovim banjoje" },
  { de: "Reparatur", sq: "Riparim" },
]

type CustomerMode = "existing" | "new" | "later"

export function UniversalWizard({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [workTitle, setWorkTitle] = useState("")
  const [customerMode, setCustomerMode] = useState<CustomerMode>("later")
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerCity, setCustomerCity] = useState("")
  const [areaM2, setAreaM2] = useState("")
  const [helpersCount, setHelpersCount] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("16:00")
  const [durationDays, setDurationDays] = useState(1)
  const [workOnWeekends, setWorkOnWeekends] = useState(false)
  const [notes, setNotes] = useState("")
  const [materialNeeded, setMaterialNeeded] = useState(false)
  const [offerNeeded, setOfferNeeded] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [error, setError] = useState("")

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerId),
    [customerId, customers]
  )

  const canSave = workTitle.trim().length > 1 && (customerMode !== "new" || customerName.trim().length > 1)

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
    <div className="mx-auto flex max-w-3xl flex-col gap-4 pb-24">
      <Link href="/neuer-auftrag" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Zurueck
      </Link>

      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Hammer className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-tight">
              <span className="nsh-i18n" data-sq="Cila eshte puna?">Neue Baustelle</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="nsh-i18n" data-sq="Mjafton vetem puna. Te tjerat jane opsionale.">Nur die Arbeit ist Pflicht. Alles andere kann spaeter kommen.</span>
            </p>
          </div>
        </div>

        <textarea
          value={workTitle}
          onChange={(event) => setWorkTitle(event.target.value)}
          placeholder="z.B. Kueche renovieren, Boden raus, Vinyl rein"
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

        <div className="mt-4 rounded-lg border border-primary/25 bg-primary/5 p-3">
          <p className="text-sm font-bold text-primary">
            <span className="nsh-i18n" data-sq="Ruaje tani, planifikoje ne mengjes.">Speichern jetzt, morgens auf Heute einplanen.</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="nsh-i18n" data-sq="Ne faqen kryesore zgjedh ku punon sot dhe per sa ore.">Auf dem Home-Screen waehlt dein Vater dann, wo er heute arbeitet und wie lange.</span>
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setDetailsOpen((value) => !value)}
        className="flex min-h-14 items-center justify-between rounded-lg border bg-card px-4 text-left font-black shadow-sm"
      >
        <span className="flex items-center gap-2">
          <ClipboardList className="size-5 text-muted-foreground" />
          Optionale Details
        </span>
        <ChevronDown className={cn("size-5 transition-transform", detailsOpen && "rotate-180")} />
      </button>

      {detailsOpen && (
        <div className="space-y-4">
          <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
            <SectionTitle icon={UserRound} title="Kunde" subtitle="Kann leer bleiben." />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { value: "later" as const, label: "Spaeter" },
                { value: "existing" as const, label: "Kunde waehlen", disabled: customers.length === 0 },
                { value: "new" as const, label: "Neu" },
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
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
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
                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Name *" className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary" />
                <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Telefon" type="tel" className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary" />
                <input value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Adresse" className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary sm:col-span-2" />
                <input value={customerCity} onChange={(event) => setCustomerCity(event.target.value)} placeholder="Ort" className="h-14 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary" />
              </div>
            )}
          </section>

          <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
            <SectionTitle icon={CalendarDays} title="Planung" subtitle="Nur ausfuellen, wenn der Termin schon feststeht." />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Startdatum</span>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase text-muted-foreground">Von</span>
                <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase text-muted-foreground">Bis</span>
                <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary" />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Flaeche m2</span>
                <input type="number" min="0" value={areaM2} onChange={(event) => setAreaM2(event.target.value)} placeholder="z.B. 80" className="h-14 w-full rounded-lg border-2 border-border bg-background px-4 text-base font-semibold outline-none focus:border-primary" />
              </label>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Helfer</span>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((count) => (
                    <button key={count} type="button" onClick={() => setHelpersCount(count)} className={cn("h-14 rounded-lg border-2 text-base font-black", helpersCount === count ? "border-primary bg-primary/10 text-primary" : "border-border bg-background")}>{count}</button>
                  ))}
                </div>
              </div>
            </div>

            {startDate && (
              <>
                <DaySchedulePreview date={startDate} startTime={startTime} endTime={endTime} className="mt-3" />
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {[
                    { value: 1, label: "1 Tag" },
                    { value: 2, label: "2 Tage" },
                    { value: 3, label: "3 Tage" },
                    { value: 5, label: "1 Woche" },
                    { value: 10, label: "2 Wochen" },
                  ].map((option) => (
                    <button key={option.value} type="button" onClick={() => setDurationDays(option.value)} className={cn("min-h-12 rounded-lg border-2 px-2 text-sm font-black transition-colors", durationDays === option.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background")}>{option.label}</button>
                  ))}
                </div>
                <label className="mt-3 flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                  <input type="checkbox" checked={workOnWeekends} onChange={(event) => setWorkOnWeekends(event.target.checked)} className="size-5 accent-primary" />
                  <span className="text-sm font-bold">Auch Samstag/Sonntag einplanen</span>
                </label>
              </>
            )}
          </section>

          <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
            <SectionTitle icon={PackageCheck} title="Aufgaben und Notiz" subtitle="Wird automatisch als Aufgabe angelegt, wenn aktiv." />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ToggleButton checked={offerNeeded} onClick={() => setOfferNeeded((value) => !value)} icon={Check} label="Angebot schicken" />
              <ToggleButton checked={materialNeeded} onClick={() => setMaterialNeeded((value) => !value)} icon={PackageCheck} label="Material pruefen" />
            </div>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notiz, Material, Besonderheiten, Kundenwunsch ..." rows={4} className="mt-3 w-full resize-none rounded-lg border-2 border-border bg-background p-4 text-base outline-none focus:border-primary" />
          </section>
        </div>
      )}

      {error && <p className="rounded-lg bg-destructive/10 p-3 font-semibold text-destructive">{error}</p>}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 backdrop-blur md:left-[var(--sidebar-width,0px)]">
        <div className="mx-auto max-w-3xl">
          <Button size="touch-xl" className="w-full gap-2" onClick={save} disabled={!canSave || isPending}>
            {isPending ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
            <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={isPending ? "Duke ruajtur..." : "Ruaj kantierin"}>
              {isPending ? "Speichert..." : "Baustelle speichern"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Hammer; title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-lg font-black leading-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
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
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md border-2", checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>
        {checked && <Icon className="size-4" />}
      </span>
      {label}
    </button>
  )
}

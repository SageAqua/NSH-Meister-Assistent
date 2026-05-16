"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Edit3, Save, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { deleteProject, updateProject } from "@/app/actions/orders"
import type { Customer, Project, ProjectStatus } from "@/types"

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "geplant", label: "Geplant" },
  { value: "in_arbeit", label: "In Arbeit" },
  { value: "fertig", label: "Fertig" },
  { value: "abgesagt", label: "Abgesagt" },
]

const SERVICES = [
  { value: "vinyl", label: "Vinyl verlegen" },
  { value: "laminat", label: "Laminat verlegen" },
  { value: "parkett", label: "Parkett verlegen" },
  { value: "spachtel", label: "Spachtelarbeiten" },
  { value: "trockenbau", label: "Trockenbau" },
  { value: "waende", label: "Wände streichen" },
  { value: "decke", label: "Decke streichen" },
  { value: "sonstiges", label: "Sonstiges" },
]

export function ProjectEditor({
  project,
  customers,
}: {
  project: Project
  customers: Customer[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    customerId: project.customer_id ?? "",
    serviceType: project.service_type,
    status: project.status,
    address: project.address ?? "",
    areaM2: project.area_m2?.toString() ?? "",
    helpersCount: project.helpers_count?.toString() ?? "0",
    notes: project.notes ?? "",
  })

  function save() {
    setError("")
    startTransition(async () => {
      const result = await updateProject({
        id: project.id,
        customerId: form.customerId || undefined,
        serviceType: form.serviceType,
        status: form.status,
        address: form.address,
        areaM2: form.areaM2 ? Number(form.areaM2) : null,
        helpersCount: form.helpersCount ? Number(form.helpersCount) : 0,
        notes: form.notes,
      })
      if (result.error) setError(result.error)
      else {
        setOpen(false)
        router.refresh()
      }
    })
  }

  function remove() {
    if (!window.confirm("Diese Baustelle wirklich löschen? Termine, Aufgaben und Material dazu werden auch gelöscht.")) return
    startTransition(async () => {
      const result = await deleteProject(project.id)
      if (result.error) setError(result.error)
      else router.push("/baustellen")
    })
  }

  if (!open) {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button size="touch" className="gap-2" onClick={() => setOpen(true)}>
          <Edit3 className="size-4" /> Baustelle bearbeiten
        </Button>
        <Button size="touch" variant="destructive" className="gap-2" onClick={remove} disabled={isPending}>
          <Trash2 className="size-4" /> Löschen
        </Button>
        {error && <p className="text-sm font-semibold text-destructive sm:col-span-2">{error}</p>}
      </div>
    )
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Baustelle bearbeiten</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex size-8 items-center justify-center rounded-lg hover:bg-accent"
            aria-label="Schließen"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">Kunde</span>
            <select
              value={form.customerId}
              onChange={(event) => setForm((value) => ({ ...value, customerId: event.target.value }))}
              className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Kein Kunde</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">Leistung</span>
            <select
              value={form.serviceType}
              onChange={(event) => setForm((value) => ({ ...value, serviceType: event.target.value }))}
              className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            >
              {SERVICES.map((service) => (
                <option key={service.value} value={service.value}>{service.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm((value) => ({ ...value, status: event.target.value as ProjectStatus }))}
              className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">Fläche m²</span>
            <input
              type="number"
              value={form.areaM2}
              onChange={(event) => setForm((value) => ({ ...value, areaM2: event.target.value }))}
              className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">Helfer</span>
            <input
              type="number"
              value={form.helpersCount}
              onChange={(event) => setForm((value) => ({ ...value, helpersCount: event.target.value }))}
              className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Adresse</span>
          <input
            value={form.address}
            onChange={(event) => setForm((value) => ({ ...value, address: event.target.value }))}
            className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Notizen</span>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(event) => setForm((value) => ({ ...value, notes: event.target.value }))}
            className="w-full resize-none rounded-lg border-2 border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <Button size="touch" className="gap-2" onClick={save} disabled={isPending}>
            <Save className="size-4" /> {isPending ? "Speichert..." : "Speichern"}
          </Button>
          <Button size="touch" variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useMemo, useState, useTransition } from "react"
import type { ComponentType } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { deleteProject, updateProject } from "@/app/actions/orders"
import type { Customer, Project, ProjectStatus } from "@/types"

type ProjectWithCustomer = Project & { customers?: Customer | null }

const STATUS_LABELS: Record<ProjectStatus, string> = {
  geplant: "Geplant",
  in_arbeit: "In Arbeit",
  fertig: "Fertig",
  abgesagt: "Abgesagt",
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  geplant: "bg-blue-100 text-blue-700 border-blue-200",
  in_arbeit: "bg-orange-100 text-orange-700 border-orange-200",
  fertig: "bg-green-100 text-green-700 border-green-200",
  abgesagt: "bg-gray-100 text-gray-500 border-gray-200",
}

const SERVICE_LABELS: Record<string, string> = {
  vinyl: "Vinyl verlegen",
  laminat: "Laminat verlegen",
  parkett: "Parkett verlegen",
  spachtel: "Spachtelarbeiten",
  trockenbau: "Trockenbau",
  waende: "Wände streichen",
  decke: "Decke streichen",
}

const SERVICE_OPTIONS = [
  { value: "vinyl", label: "Vinyl verlegen" },
  { value: "laminat", label: "Laminat verlegen" },
  { value: "parkett", label: "Parkett verlegen" },
  { value: "spachtel", label: "Spachtelarbeiten" },
  { value: "trockenbau", label: "Trockenbau" },
  { value: "waende", label: "Wände streichen" },
  { value: "decke", label: "Decke streichen" },
  { value: "sonstiges", label: "Sonstiges" },
]

const STATUSES: ProjectStatus[] = ["geplant", "in_arbeit", "fertig", "abgesagt"]

function statusLabel(status: ProjectStatus) {
  return STATUS_LABELS[status] ?? status
}

function serviceLabel(service: string) {
  return SERVICE_LABELS[service] ?? service
}

function getCustomerName(project: ProjectWithCustomer) {
  return project.customers?.name ?? "Unbekannter Kunde"
}

export function BaustellenClient({
  projects,
  customers,
}: {
  projects: ProjectWithCustomer[]
  customers: Customer[]
}) {
  const active = projects.filter((project) => project.status === "in_arbeit")
  const planned = projects.filter((project) => project.status === "geplant")
  const done = projects.filter((project) => project.status === "fertig" || project.status === "abgesagt")

  const stats = useMemo(
    () => [
      { label: "In Arbeit", value: active.length, className: "border-orange-200 bg-orange-50 text-orange-700" },
      { label: "Geplant", value: planned.length, className: "border-blue-200 bg-blue-50 text-blue-700" },
      { label: "Fertig", value: projects.filter((p) => p.status === "fertig").length, className: "border-green-200 bg-green-50 text-green-700" },
    ],
    [active.length, planned.length, projects]
  )

  return (
    <div className="nsh-page">
      <div className="nsh-page-header flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="nsh-eyebrow">Arbeit</p>
          <h1 className="nsh-title">Baustellen</h1>
          <p className="nsh-subtitle">Kantieret - {projects.length} gesamt</p>
        </div>
        <Link href="/neuer-auftrag">
          <Button size="touch" className="gap-2">
            <Plus className="size-4" /> Neu
          </Button>
        </Link>
      </div>

      {projects.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className={cn("rounded-lg border p-4", stat.className)}>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto mb-3 size-10 text-muted-foreground" />
            <p className="text-lg font-semibold text-muted-foreground">Noch keine Baustellen.</p>
            <p className="text-sm text-muted-foreground mb-4">Nuk ka kantiere akoma.</p>
            <Link href="/neuer-auftrag">
              <Button size="touch">Ersten Auftrag anlegen</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {active.length > 0 && <ProjectSection title="In Arbeit" projects={active} customers={customers} />}
          {planned.length > 0 && <ProjectSection title="Geplant" projects={planned} customers={customers} />}
          {done.length > 0 && <ProjectSection title="Abgeschlossen" projects={done} customers={customers} />}
        </div>
      )}
    </div>
  )
}

function ProjectSection({
  title,
  projects,
  customers,
}: {
  title: string
  projects: ProjectWithCustomer[]
  customers: Customer[]
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <Badge variant="secondary">{projects.length}</Badge>
      </div>
      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} customers={customers} />
        ))}
      </div>
    </section>
  )
}

function ProjectCard({ project, customers }: { project: ProjectWithCustomer; customers: Customer[] }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
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
      if (result.error) {
        setError(result.error)
      } else {
        setIsEditing(false)
        router.refresh()
      }
    })
  }

  function remove() {
    if (!window.confirm("Diese Baustelle wirklich löschen? Termine, Aufgaben und Material dazu werden auch gelöscht.")) return
    startTransition(async () => {
      const result = await deleteProject(project.id)
      if (result.error) setError(result.error)
      else router.refresh()
    })
  }

  if (isEditing) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">Baustelle bearbeiten</h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
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
                {SERVICE_OPTIONS.map((service) => (
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
                  <option key={status} value={status}>{statusLabel(status)}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">Fläche m²</span>
              <input
                type="number"
                min="0"
                value={form.areaM2}
                onChange={(event) => setForm((value) => ({ ...value, areaM2: event.target.value }))}
                className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">Helfer</span>
              <input
                type="number"
                min="0"
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
              value={form.notes}
              onChange={(event) => setForm((value) => ({ ...value, notes: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-lg border-2 border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
            <Button size="touch" className="gap-2" onClick={save} disabled={isPending}>
              <Save className="size-4" /> {isPending ? "Speichert..." : "Speichern"}
            </Button>
            <Button size="touch" variant="outline" onClick={() => setIsEditing(false)}>
              Abbrechen
            </Button>
            <Button size="touch" variant="destructive" className="gap-2" onClick={remove} disabled={isPending}>
              <Trash2 className="size-4" /> Löschen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all hover:border-primary/30 hover:shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", STATUS_COLORS[project.status])}>
                {statusLabel(project.status)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{serviceLabel(project.service_type)}</span>
            </div>
            <h3 className="truncate text-lg font-bold">{getCustomerName(project)}</h3>
            {(project.address || project.customers?.city) && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{[project.address, project.customers?.city].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border hover:bg-accent"
            aria-label="Baustelle bearbeiten"
          >
            <Edit3 className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoTile icon={Building2} label="Fläche" value={project.area_m2 ? `${project.area_m2} m²` : "-"} />
          <InfoTile icon={UserRound} label="Helfer" value={`${project.helpers_count ?? 0}`} />
          <InfoTile icon={CalendarDays} label="Seit" value={new Date(project.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} />
          <InfoTile icon={MoreHorizontal} label="Typ" value={project.vinyl_type ?? project.object_type ?? "-"} />
        </div>

        {project.notes && (
          <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{project.notes}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Link href={`/baustellen/${project.id}`}>
            <Button size="sm" className="gap-2">
              <CheckCircle2 className="size-4" /> Öffnen
            </Button>
          </Link>
          {project.customers?.phone && (
            <a href={`tel:${project.customers.phone}`}>
              <Button size="sm" variant="outline" className="gap-2">
                <Phone className="size-4" /> Anrufen
              </Button>
            </a>
          )}
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
            <Edit3 className="size-4" /> Bearbeiten
          </Button>
        </div>

        {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <p className="truncate text-sm font-bold">{value}</p>
    </div>
  )
}

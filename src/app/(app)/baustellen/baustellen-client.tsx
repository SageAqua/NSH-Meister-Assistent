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

const STATUS_LABELS_SQ: Record<ProjectStatus, string> = {
  geplant: "Planifikuar",
  in_arbeit: "Në punë",
  fertig: "Gati",
  abgesagt: "Anuluar",
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

const SERVICE_LABELS_SQ: Record<string, string> = {
  vinyl: "Vendosje vinyl",
  laminat: "Vendosje laminat",
  parkett: "Vendosje parket",
  spachtel: "Nivelim me masë",
  trockenbau: "Ndërtim i thatë",
  waende: "Lyerje muresh",
  decke: "Lyerje tavani",
  sonstiges: "Tjetër",
}

const SERVICE_OPTIONS = [
  { value: "vinyl", label: "Vinyl verlegen", sq: "Vendosje vinyl" },
  { value: "laminat", label: "Laminat verlegen", sq: "Vendosje laminat" },
  { value: "parkett", label: "Parkett verlegen", sq: "Vendosje parket" },
  { value: "spachtel", label: "Spachtelarbeiten", sq: "Nivelim me masë" },
  { value: "trockenbau", label: "Trockenbau", sq: "Ndërtim i thatë" },
  { value: "waende", label: "Wände streichen", sq: "Lyerje muresh" },
  { value: "decke", label: "Decke streichen", sq: "Lyerje tavani" },
  { value: "sonstiges", label: "Sonstiges", sq: "Tjetër" },
]

const STATUSES: ProjectStatus[] = ["geplant", "in_arbeit", "fertig", "abgesagt"]

function statusLabel(status: ProjectStatus) {
  return STATUS_LABELS[status] ?? status
}

function statusLabelSq(status: ProjectStatus) {
  return STATUS_LABELS_SQ[status] ?? status
}

function serviceLabel(service: string) {
  return SERVICE_LABELS[service] ?? service
}

function serviceLabelSq(service: string) {
  return SERVICE_LABELS_SQ[service] ?? service
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
      { label: "In Arbeit", sq: "Në punë", value: active.length, className: "border-orange-200 bg-orange-50 text-orange-700" },
      { label: "Geplant", sq: "Planifikuar", value: planned.length, className: "border-blue-200 bg-blue-50 text-blue-700" },
      { label: "Fertig", sq: "Gati", value: projects.filter((p) => p.status === "fertig").length, className: "border-green-200 bg-green-50 text-green-700" },
    ],
    [active.length, planned.length, projects]
  )

  return (
    <div className="nsh-page">
      <div className="nsh-page-header flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="nsh-eyebrow">
            <span className="nsh-i18n" data-sq="Punë">Arbeit</span>
          </p>
          <h1 className="nsh-title">
            <span className="nsh-i18n" data-sq="Kantiere">Baustellen</span>
          </h1>
          <p className="nsh-subtitle">
            <span className="nsh-i18n" data-sq={`${projects.length} gjithsej`}>{projects.length} gesamt</span>
          </p>
        </div>
        <Link href="/neuer-auftrag">
          <Button size="touch" className="gap-2">
            <Plus className="size-4" />
            <span className="nsh-i18n nsh-i18n-button" data-sq="E re">Neu</span>
          </Button>
        </Link>
      </div>

      {projects.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className={cn("rounded-lg border p-4", stat.className)}>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs font-bold">
                <span className="nsh-i18n" data-sq={stat.sq}>{stat.label}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto mb-3 size-10 text-muted-foreground" />
            <p className="text-lg font-semibold text-muted-foreground">
              <span className="nsh-i18n nsh-i18n-center" data-sq="Nuk ka kantiere akoma.">Noch keine Baustellen.</span>
            </p>
            <Link href="/neuer-auftrag">
              <Button size="touch">
                <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq="Krijo porosinë e parë">Ersten Auftrag anlegen</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {active.length > 0 && <ProjectSection title="In Arbeit" titleSq="Në punë" projects={active} customers={customers} />}
          {planned.length > 0 && <ProjectSection title="Geplant" titleSq="Planifikuar" projects={planned} customers={customers} />}
          {done.length > 0 && <ProjectSection title="Abgeschlossen" titleSq="Mbyllur" projects={done} customers={customers} />}
        </div>
      )}
    </div>
  )
}

function ProjectSection({
  title,
  titleSq,
  projects,
  customers,
}: {
  title: string
  titleSq: string
  projects: ProjectWithCustomer[]
  customers: Customer[]
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          <span className="nsh-i18n" data-sq={titleSq}>{title}</span>
        </h2>
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
    if (!window.confirm("Diese Baustelle wirklich löschen?\nA ta fshijmë vërtet këtë kantier?\n\nTermine, Aufgaben und Material dazu werden auch gelöscht.\nTerminet, detyrat dhe materialet do të fshihen gjithashtu.")) return
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
            <h3 className="font-bold">
              <span className="nsh-i18n" data-sq="Ndrysho kantierin">Baustelle bearbeiten</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-accent"
              aria-label="Schließen / Mbyll"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">
                <span className="nsh-i18n" data-sq="Klient">Kunde</span>
              </span>
              <select
                value={form.customerId}
                onChange={(event) => setForm((value) => ({ ...value, customerId: event.target.value }))}
                className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Kein Kunde / Pa klient</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">
                <span className="nsh-i18n" data-sq="Shërbimi">Leistung</span>
              </span>
              <select
                value={form.serviceType}
                onChange={(event) => setForm((value) => ({ ...value, serviceType: event.target.value }))}
                className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              >
                {SERVICE_OPTIONS.map((service) => (
                  <option key={service.value} value={service.value}>{service.label} / {service.sq}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">
                <span className="nsh-i18n" data-sq="Statusi">Status</span>
              </span>
              <select
                value={form.status}
                onChange={(event) => setForm((value) => ({ ...value, status: event.target.value as ProjectStatus }))}
                className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{statusLabel(status)} / {statusLabelSq(status)}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">
                <span className="nsh-i18n" data-sq="Sipërfaqe m²">Fläche m²</span>
              </span>
              <input
                type="number"
                min="0"
                value={form.areaM2}
                onChange={(event) => setForm((value) => ({ ...value, areaM2: event.target.value }))}
                className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">
                <span className="nsh-i18n" data-sq="Ndihmës">Helfer</span>
              </span>
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
            <span className="text-xs font-bold text-muted-foreground">
              <span className="nsh-i18n" data-sq="Adresa">Adresse</span>
            </span>
            <input
              value={form.address}
              onChange={(event) => setForm((value) => ({ ...value, address: event.target.value }))}
              className="h-11 w-full rounded-lg border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              <span className="nsh-i18n" data-sq="Shënime">Notizen</span>
            </span>
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
              <Save className="size-4" />
              <span className="nsh-i18n nsh-i18n-button" data-sq={isPending ? "Duke ruajtur..." : "Ruaj"}>
                {isPending ? "Speichert..." : "Speichern"}
              </span>
            </Button>
            <Button size="touch" variant="outline" onClick={() => setIsEditing(false)}>
              <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq="Anulo">Abbrechen</span>
            </Button>
            <Button size="touch" variant="destructive" className="gap-2" onClick={remove} disabled={isPending}>
              <Trash2 className="size-4" />
              <span className="nsh-i18n nsh-i18n-button" data-sq="Fshi">Löschen</span>
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
                <span className="nsh-i18n" data-sq={statusLabelSq(project.status)}>{statusLabel(project.status)}</span>
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                <span className="nsh-i18n" data-sq={serviceLabelSq(project.service_type)}>{serviceLabel(project.service_type)}</span>
              </span>
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
            aria-label="Baustelle bearbeiten / Ndrysho kantierin"
          >
            <Edit3 className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoTile icon={Building2} label="Fläche" labelSq="Sipërfaqe" value={project.area_m2 ? `${project.area_m2} m²` : "-"} />
          <InfoTile icon={UserRound} label="Helfer" labelSq="Ndihmës" value={`${project.helpers_count ?? 0}`} />
          <InfoTile icon={CalendarDays} label="Seit" labelSq="Që prej" value={new Date(project.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} />
          <InfoTile icon={MoreHorizontal} label="Typ" labelSq="Lloji" value={project.vinyl_type ?? project.object_type ?? "-"} />
        </div>

        {project.notes && (
          <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{project.notes}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Link href={`/baustellen/${project.id}`}>
            <Button size="sm" className="gap-2">
              <CheckCircle2 className="size-4" />
              <span className="nsh-i18n nsh-i18n-button" data-sq="Hap">Öffnen</span>
            </Button>
          </Link>
          {project.customers?.phone && (
            <a href={`tel:${project.customers.phone}`}>
              <Button size="sm" variant="outline" className="gap-2">
                <Phone className="size-4" />
                <span className="nsh-i18n nsh-i18n-button" data-sq="Telefono">Anrufen</span>
              </Button>
            </a>
          )}
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
            <Edit3 className="size-4" />
            <span className="nsh-i18n nsh-i18n-button" data-sq="Ndrysho">Bearbeiten</span>
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
  labelSq,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  labelSq: string
  value: string
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground">
        <Icon className="size-3" />
        <span className="nsh-i18n" data-sq={labelSq}>{label}</span>
      </div>
      <p className="truncate text-sm font-bold">{value}</p>
    </div>
  )
}

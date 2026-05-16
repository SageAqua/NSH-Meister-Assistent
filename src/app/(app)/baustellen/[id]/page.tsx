import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Phone, Navigation, Calendar, FileText, Package, CheckCircle2, Clock, MapPin, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { markEventDone, markTaskDone, updateProjectStatus } from "@/app/actions/orders"
import type { Project, CalendarEvent, Task, Note, Material } from "@/types"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  geplant: "bg-blue-100 text-blue-700",
  in_arbeit: "bg-orange-100 text-orange-700",
  fertig: "bg-green-100 text-green-700",
  abgesagt: "bg-gray-100 text-gray-500",
}

const MATERIAL_STATUS: Record<string, { label: string; color: string }> = {
  benoetigt: { label: "Benötigt", color: "bg-red-100 text-red-700" },
  bestellt: { label: "Bestellt", color: "bg-yellow-100 text-yellow-700" },
  vorhanden: { label: "Vorhanden", color: "bg-blue-100 text-blue-700" },
  abgeholt: { label: "Abgeholt", color: "bg-purple-100 text-purple-700" },
  erledigt: { label: "Erledigt", color: "bg-green-100 text-green-700" },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })
}

export default async function BaustelleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!id) notFound()

  const supabase = await createClient()

  const [
    { data: project },
    { data: events },
    { data: tasks },
    { data: notes },
    { data: materials },
  ] = await Promise.all([
    supabase.from("projects").select("*, customers(*)").eq("id", id).single(),
    supabase.from("calendar_events").select("*").eq("project_id", id).order("start_time"),
    supabase.from("tasks").select("*").eq("project_id", id).order("created_at"),
    supabase.from("notes").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("materials").select("*").eq("project_id", id).order("created_at"),
  ])

  if (!project) notFound()

  const p = project as Project
  const customer = p.customers
  const upcomingEvents = ((events ?? []) as CalendarEvent[]).filter((e) => e.status !== "erledigt")
  const nextEvent = upcomingEvents[0]

  const extras = p.extras as Record<string, boolean>
  const extraLabels: Record<string, string> = {
    bodenEntfernen: "Boden entfernen", spachteln: "Spachteln",
    sockelleisten: "Sockelleisten", tuerenKuerzen: "Türen kürzen",
    moebelRaeumen: "Möbel räumen", materialHolen: "Material holen",
    entsorgung: "Entsorgung", endreinigung: "Endreinigung",
  }

  return (
    <div className="w-full max-w-2xl space-y-5">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <Link href="/baustellen">
          <button className="mt-1 flex size-9 items-center justify-center rounded-full hover:bg-accent">
            <ChevronLeft className="size-5" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_COLORS[p.status])}>
              {p.status === "geplant" ? "Geplant" : p.status === "in_arbeit" ? "In Arbeit" : p.status === "fertig" ? "Fertig" : "Abgesagt"}
            </span>
            <span className="text-sm text-muted-foreground">{p.service_type}</span>
          </div>
          <h1 className="text-2xl font-bold">{customer?.name ?? "Unbekannt"}</h1>
          {(p.address || customer?.city) && (
            <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
              <MapPin className="size-4 shrink-0" />
              <span className="min-w-0 break-words">{[p.address, customer?.city].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {customer?.phone && (
          <>
            <a href={`tel:${customer.phone}`}>
              <Button size="touch" variant="outline" className="gap-2">
                <Phone className="size-4" /> Anrufen
              </Button>
            </a>
            <a href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
              <Button size="touch" variant="outline" className="gap-2">
                <span className="text-base">💬</span> WhatsApp
              </Button>
            </a>
          </>
        )}
        {(p.address || customer?.city) && (
          <a href={`https://maps.google.com/?q=${encodeURIComponent([p.address, customer?.city].filter(Boolean).join(", "))}`} target="_blank" rel="noopener noreferrer">
            <Button size="touch" variant="outline" className="gap-2">
              <Navigation className="size-4" /> Navigation
            </Button>
          </a>
        )}
      </div>

      {/* Status change */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-2">Status ändern</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "geplant", label: "Geplant" },
              { value: "in_arbeit", label: "In Arbeit" },
              { value: "fertig", label: "Fertig" },
              { value: "abgesagt", label: "Abgesagt" },
            ].map((s) => (
              <form key={s.value} action={updateProjectStatus.bind(null, p.id, s.value)}>
                <button
                  type="submit"
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    p.status === s.value ? STATUS_COLORS[s.value] + " border-transparent" : "border-border hover:bg-accent"
                  )}
                >
                  {s.label}
                </button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-base mb-2">Details</h3>
          {[
            { label: "Fläche", value: p.area_m2 ? `${p.area_m2} m²` : null },
            { label: "Vinyl-Art", value: p.vinyl_type },
            { label: "Objekttyp", value: p.object_type },
            { label: "Untergrund", value: p.ground_condition },
            { label: "Material", value: p.material_supply },
          ].filter((r) => r.value).map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5 py-1 border-b last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm font-semibold capitalize sm:text-right">{row.value}</span>
            </div>
          ))}
          {Object.entries(extras).filter(([, v]) => v).length > 0 && (
            <div className="pt-1">
              <p className="text-sm text-muted-foreground mb-1">Zusatzarbeiten</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(extras).filter(([, v]) => v).map(([k]) => (
                  <Badge key={k} variant="secondary" className="text-xs">{extraLabels[k] ?? k}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next event */}
      {nextEvent && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="size-4 text-primary" />
              <h3 className="font-bold">Nächster Termin</h3>
            </div>
            <p className="text-lg font-bold">{nextEvent.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm mt-1">
              <Clock className="size-4" />
              {formatDate(nextEvent.start_time)} · {formatTime(nextEvent.start_time)} – {formatTime(nextEvent.end_time)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All events */}
      {events && events.length > 0 && (
        <section>
          <h3 className="mb-2 font-bold flex items-center gap-2">
            <Calendar className="size-4" /> Alle Termine ({events.length})
          </h3>
          <div className="space-y-2">
            {(events as CalendarEvent[]).map((e) => (
              <div key={e.id} className={cn("flex min-w-0 items-center gap-3 rounded-xl border p-3", e.status === "erledigt" && "opacity-60")}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(e.start_time)} · {formatTime(e.start_time)}–{formatTime(e.end_time)}
                  </p>
                </div>
                {e.status === "erledigt" ? (
                  <Badge variant="secondary" className="text-xs shrink-0">Erledigt</Badge>
                ) : (
                  <form action={markEventDone.bind(null, e.id)}>
                    <Button size="sm" type="submit" className="h-8 shrink-0">✓</Button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tasks */}
      {tasks && tasks.length > 0 && (
        <section>
          <h3 className="mb-2 font-bold flex items-center gap-2">
            <CheckCircle2 className="size-4" /> Aufgaben ({tasks.length})
          </h3>
          <div className="space-y-2">
            {(tasks as Task[]).map((t) => (
              <form key={t.id} action={markTaskDone.bind(null, t.id)}>
                <button type="submit" className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:bg-accent transition-colors">
                  <div className={cn("size-5 shrink-0 rounded-full border-2 flex items-center justify-center", t.is_done ? "border-green-500 bg-green-500" : "border-muted-foreground")}>
                    {t.is_done && <Check className="size-3 text-white" />}
                  </div>
                  <span className={cn("text-sm font-medium", t.is_done && "line-through text-muted-foreground")}>{t.title}</span>
                </button>
              </form>
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {notes && notes.length > 0 && (
        <section>
          <h3 className="mb-2 font-bold flex items-center gap-2">
            <FileText className="size-4" /> Notizen ({notes.length})
          </h3>
          <div className="space-y-2">
            {(notes as Note[]).map((n) => (
              <div key={n.id} className="rounded-xl border p-3">
                <p className="text-sm">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.created_at).toLocaleDateString("de-DE")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Materials */}
      {materials && materials.length > 0 && (
        <section>
          <h3 className="mb-2 font-bold flex items-center gap-2">
            <Package className="size-4" /> Material ({materials.length})
          </h3>
          <div className="space-y-2">
            {(materials as Material[]).map((m) => (
              <div key={m.id} className="flex min-w-0 items-center gap-3 rounded-xl border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{m.name}</p>
                  {m.quantity && <p className="text-xs text-muted-foreground">{m.quantity} {m.unit}</p>}
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", MATERIAL_STATUS[m.status]?.color ?? "")}>
                  {MATERIAL_STATUS[m.status]?.label ?? m.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

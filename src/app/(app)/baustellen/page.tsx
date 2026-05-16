import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Building2, MapPin, Phone, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  geplant: "Geplant",
  in_arbeit: "In Arbeit",
  fertig: "Fertig",
  abgesagt: "Abgesagt",
}

const STATUS_COLORS: Record<string, string> = {
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
}

export default async function BaustellenPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("*, customers(*)")
    .order("created_at", { ascending: false })

  const allProjects = (projects ?? []) as Project[]
  const active = allProjects.filter((p) => p.status === "in_arbeit")
  const planned = allProjects.filter((p) => p.status === "geplant")
  const done = allProjects.filter((p) => p.status === "fertig" || p.status === "abgesagt")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Baustellen</h1>
          <p className="text-muted-foreground text-sm">Kantieret — {allProjects.length} gesamt</p>
        </div>
        <Link href="/neuer-auftrag">
          <Button size="touch" className="gap-2">
            <Plus className="size-4" /> Neu
          </Button>
        </Link>
      </div>

      {allProjects.length === 0 && (
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
      )}

      {active.length > 0 && <ProjectSection title="In Arbeit" projects={active} />}
      {planned.length > 0 && <ProjectSection title="Geplant" projects={planned} />}
      {done.length > 0 && <ProjectSection title="Abgeschlossen" projects={done} />}
    </div>
  )
}

function ProjectSection({ title, projects }: { title: string; projects: Project[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="space-y-3">
        {projects.map((p) => (
          <Link key={p.id} href={`/baustellen/${p.id}`}>
            <Card className="transition-all hover:shadow-md hover:border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                        STATUS_COLORS[p.status]
                      )}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {SERVICE_LABELS[p.service_type] ?? p.service_type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold truncate">
                      {p.customers?.name ?? "Unbekannter Kunde"}
                    </h3>
                    {(p.address || p.customers?.city) && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {[p.address, p.customers?.city].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {p.area_m2 && (
                      <p className="text-sm text-muted-foreground mt-0.5">{p.area_m2} m²</p>
                    )}
                  </div>
                  {p.customers?.phone && (
                    <a
                      href={`tel:${p.customers.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted hover:bg-accent"
                    >
                      <Phone className="size-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

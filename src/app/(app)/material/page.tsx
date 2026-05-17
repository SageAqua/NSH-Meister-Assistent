import Link from "next/link"
import { Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Material } from "@/types"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  benoetigt: { label: "Benoetigt", color: "bg-red-100 text-red-700 border-red-200" },
  bestellt: { label: "Bestellt", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  vorhanden: { label: "Vorhanden", color: "bg-blue-100 text-blue-700 border-blue-200" },
  abgeholt: { label: "Abgeholt", color: "bg-purple-100 text-purple-700 border-purple-200" },
  erledigt: { label: "Erledigt", color: "bg-green-100 text-green-700 border-green-200" },
}

type MaterialWithProject = Material & {
  projects: {
    id: string
    service_type: string
    address: string | null
    customers: { name: string } | null
  } | null
}

export default async function MaterialPage() {
  const supabase = await createClient()
  const { data: materials } = await supabase
    .from("materials")
    .select("*, projects(id, service_type, address, customers(name))")
    .order("created_at", { ascending: false })

  const allMaterials = (materials ?? []) as MaterialWithProject[]
  const grouped: Record<string, MaterialWithProject[]> = {}

  allMaterials.forEach((material) => {
    const key = material.project_id
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(material)
  })

  return (
    <div className="nsh-page">
      <div className="nsh-page-header">
        <p className="nsh-eyebrow">Listen</p>
        <h1 className="nsh-title">Material</h1>
        <p className="nsh-subtitle">Materiali - {allMaterials.length} Eintraege nach Baustellen sortiert.</p>
      </div>

      {allMaterials.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="mx-auto mb-3 size-10 opacity-40" />
            <p className="text-lg font-semibold text-foreground">Noch kein Material erfasst.</p>
            <p className="text-sm">Material wird beim Anlegen von Auftraegen hinzugefuegt.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Object.entries(grouped).map(([projectId, items]) => {
            const project = items[0].projects
            const pending = items.filter((material) => material.status !== "erledigt").length

            return (
              <section key={projectId} className="nsh-panel p-3">
                <Link href={`/baustellen/${projectId}`}>
                  <div className="mb-2 flex min-w-0 items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2 transition-colors hover:bg-accent">
                    <div className="min-w-0">
                      <p className="font-bold">{project?.customers?.name ?? "Unbekannt"}</p>
                      <p className="truncate text-xs text-muted-foreground">{project?.address ?? project?.service_type}</p>
                    </div>
                    {pending > 0 && <Badge variant="secondary">{pending} offen</Badge>}
                  </div>
                </Link>
                <div className="space-y-2">
                  {items.map((material) => (
                    <div key={material.id} className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{material.name}</p>
                        {material.quantity && (
                          <p className="text-xs text-muted-foreground">{material.quantity} {material.unit}</p>
                        )}
                      </div>
                      <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold", STATUS_CONFIG[material.status]?.color)}>
                        {STATUS_CONFIG[material.status]?.label ?? material.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

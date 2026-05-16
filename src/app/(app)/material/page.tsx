import { createClient } from "@/lib/supabase/server"
import { Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Material } from "@/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

const STATUS_CONFIG: Record<string, { label: string; sq: string; color: string; order: number }> = {
  benoetigt: { label: "Benötigt", sq: "Nevojitet", color: "bg-red-100 text-red-700 border-red-200", order: 0 },
  bestellt: { label: "Bestellt", sq: "Porositur", color: "bg-yellow-100 text-yellow-700 border-yellow-200", order: 1 },
  vorhanden: { label: "Vorhanden", sq: "Ka material", color: "bg-blue-100 text-blue-700 border-blue-200", order: 2 },
  abgeholt: { label: "Abgeholt", sq: "Marrë", color: "bg-purple-100 text-purple-700 border-purple-200", order: 3 },
  erledigt: { label: "Erledigt", sq: "Gati", color: "bg-green-100 text-green-700 border-green-200", order: 4 },
}

export default async function MaterialPage() {
  const supabase = await createClient()
  const { data: materials } = await supabase
    .from("materials")
    .select("*, projects(id, service_type, address, customers(name))")
    .order("created_at", { ascending: false })

  const allMaterials = (materials ?? []) as (Material & { projects: { id: string; service_type: string; address: string | null; customers: { name: string } | null } | null })[]

  // Group by project
  const grouped: Record<string, typeof allMaterials> = {}
  allMaterials.forEach((m) => {
    const key = m.project_id
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Material</h1>
        <p className="text-sm text-muted-foreground">Materiali — {allMaterials.length} Einträge</p>
      </div>

      {allMaterials.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="mx-auto mb-3 size-10 opacity-40" />
            <p className="text-lg">Noch kein Material erfasst.</p>
            <p className="text-sm">Material wird beim Anlegen von Aufträgen hinzugefügt.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([projectId, items]) => {
          const project = items[0].projects
          const pending = items.filter((m) => m.status !== "erledigt").length
          return (
            <section key={projectId}>
              <Link href={`/baustellen/${projectId}`}>
                <div className="mb-2 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 hover:bg-accent transition-colors">
                  <div>
                    <p className="font-bold">{project?.customers?.name ?? "Unbekannt"}</p>
                    <p className="text-xs text-muted-foreground">{project?.address ?? project?.service_type}</p>
                  </div>
                  {pending > 0 && <Badge variant="secondary">{pending} offen</Badge>}
                </div>
              </Link>
              <div className="space-y-2">
                {items.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{m.name}</p>
                      {m.quantity && (
                        <p className="text-xs text-muted-foreground">{m.quantity} {m.unit}</p>
                      )}
                    </div>
                    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0", STATUS_CONFIG[m.status]?.color)}>
                      {STATUS_CONFIG[m.status]?.label ?? m.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}

import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Phone, Navigation, ChevronLeft, Building2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Customer, Project, Note } from "@/types"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  geplant: "bg-blue-100 text-blue-700",
  in_arbeit: "bg-orange-100 text-orange-700",
  fertig: "bg-green-100 text-green-700",
  abgesagt: "bg-gray-100 text-gray-500",
}

export default async function KundeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) notFound()

  const supabase = await createClient()
  const [{ data: customer }, { data: projects }, { data: notes }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("projects").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("notes").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ])

  if (!customer) notFound()

  const c = customer as Customer

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/kunden">
          <button className="mt-1 flex size-9 items-center justify-center rounded-full hover:bg-accent">
            <ChevronLeft className="size-5" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-2">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{c.name}</h1>
          {c.city && <p className="text-muted-foreground">{c.city}</p>}
          {c.address && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <MapPin className="size-3.5" /> {c.address}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {c.phone && (
          <>
            <a href={`tel:${c.phone}`}>
              <Button size="touch" variant="outline" className="gap-2">
                <Phone className="size-4" /> {c.phone}
              </Button>
            </a>
            <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
              <Button size="touch" variant="outline" className="gap-2">
                💬 WhatsApp
              </Button>
            </a>
          </>
        )}
        {(c.address || c.city) && (
          <a href={`https://maps.google.com/?q=${encodeURIComponent([c.address, c.city].filter(Boolean).join(", "))}`} target="_blank" rel="noopener noreferrer">
            <Button size="touch" variant="outline" className="gap-2">
              <Navigation className="size-4" /> Navigation
            </Button>
          </a>
        )}
        <Link href={`/neuer-auftrag?customerId=${c.id}`}>
          <Button size="touch" className="gap-2">+ Neuer Auftrag</Button>
        </Link>
      </div>

      {/* Notes */}
      {c.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-1">Notizen zum Kunden</p>
            <p className="text-sm text-muted-foreground">{c.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      <section>
        <h2 className="mb-3 font-bold text-lg flex items-center gap-2">
          <Building2 className="size-5" /> Baustellen ({(projects ?? []).length})
        </h2>
        {(projects ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">Noch keine Baustellen.</p>
        ) : (
          <div className="space-y-2">
            {(projects as Project[]).map((p) => (
              <Link key={p.id} href={`/baustellen/${p.id}`}>
                <Card className="hover:border-primary/30 transition-all">
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0", STATUS_COLORS[p.status])}>
                      {p.status === "geplant" ? "Geplant" : p.status === "in_arbeit" ? "In Arbeit" : p.status === "fertig" ? "Fertig" : "Abgesagt"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{p.service_type}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.address ?? "Keine Adresse"}</p>
                      {p.area_m2 && <p className="text-xs text-muted-foreground">{p.area_m2} m²</p>}
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {new Date(p.created_at).toLocaleDateString("de-DE", { month: "short", year: "numeric" })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Notes section */}
      {notes && notes.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold text-lg">Notizen ({notes.length})</h2>
          <div className="space-y-2">
            {(notes as Note[]).map((n) => (
              <Card key={n.id}>
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString("de-DE")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

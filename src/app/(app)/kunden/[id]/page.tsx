import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Phone, Navigation, ChevronLeft, Building2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="nsh-page max-w-5xl">
      {/* Header */}
      <div className="nsh-page-header flex items-start gap-3">
        <Link href="/kunden">
          <button className="mt-1 flex size-9 items-center justify-center rounded-full hover:bg-accent">
            <ChevronLeft className="size-5" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex size-14 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="nsh-title">{c.name}</h1>
          {c.city && <p className="text-muted-foreground">{c.city}</p>}
          {c.address && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <MapPin className="size-3.5 shrink-0" /> <span className="min-w-0 break-words">{c.address}</span>
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
                💬 <span className="nsh-i18n nsh-i18n-button" data-sq="WhatsApp">WhatsApp</span>
              </Button>
            </a>
          </>
        )}
        {(c.address || c.city) && (
          <a href={`https://maps.google.com/?q=${encodeURIComponent([c.address, c.city].filter(Boolean).join(", "))}`} target="_blank" rel="noopener noreferrer">
            <Button size="touch" variant="outline" className="gap-2">
              <Navigation className="size-4" />
              <span className="nsh-i18n nsh-i18n-button" data-sq="Navigim">Navigation</span>
            </Button>
          </a>
        )}
        <Link href={`/neuer-auftrag?customerId=${c.id}`}>
          <Button size="touch" className="gap-2">
            <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq="+ Porosi e re">+ Neuer Auftrag</span>
          </Button>
        </Link>
      </div>

      {/* Notes */}
      {c.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-1">
              <span className="nsh-i18n" data-sq="Shënime për klientin">Notizen zum Kunden</span>
            </p>
            <p className="text-sm text-muted-foreground">{c.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      <section>
        <h2 className="mb-3 font-bold text-lg flex items-center gap-2">
          <Building2 className="size-5" />
          <span className="nsh-i18n" data-sq={`Kantiere (${(projects ?? []).length})`}>Baustellen ({(projects ?? []).length})</span>
        </h2>
        {(projects ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">
            <span className="nsh-i18n" data-sq="Ende nuk ka kantiere.">Noch keine Baustellen.</span>
          </p>
        ) : (
          <div className="space-y-2">
            {(projects as Project[]).map((p) => (
              <Link key={p.id} href={`/baustellen/${p.id}`}>
                <Card className="hover:border-primary/30 transition-all">
                  <CardContent className="flex min-w-0 flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0", STATUS_COLORS[p.status])}>
                      {p.status === "geplant" ? "Geplant" : p.status === "in_arbeit" ? "In Arbeit" : p.status === "fertig" ? "Fertig" : "Abgesagt"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{p.service_type}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.address ?? "Keine Adresse / Pa adresë"}</p>
                      {p.area_m2 && <p className="text-xs text-muted-foreground">{p.area_m2} m²</p>}
                    </div>
                    <p className="text-xs text-muted-foreground sm:shrink-0">
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
          <h2 className="mb-3 font-bold text-lg">
            <span className="nsh-i18n" data-sq={`Shënime (${notes.length})`}>Notizen ({notes.length})</span>
          </h2>
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

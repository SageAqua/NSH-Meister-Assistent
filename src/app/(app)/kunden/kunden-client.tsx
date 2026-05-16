"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Phone, Users, ChevronRight, Plus, X, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { saveCustomer } from "@/app/actions/orders"
import type { Customer } from "@/types"

type CustomerWithProjects = Customer & { projects: { id: string; status: string }[] }

export function KundenClient({ customers }: { customers: CustomerWithProjects[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [notes, setNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleSave() {
    if (!name.trim()) return
    startTransition(async () => {
      const result = await saveCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      if (result?.error) {
        setError(result.error)
      } else {
        setName(""); setPhone(""); setAddress(""); setCity(""); setNotes("")
        setShowForm(false)
        setError("")
        router.refresh()
      }
    })
  }

  return (
    <div className="w-full max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kunden</h1>
          <p className="text-sm text-muted-foreground">Klientët — {customers.length} gesamt</p>
        </div>
        <Button size="touch" className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="size-4" /> Neuer Kontakt
        </Button>
      </div>

      {/* New contact form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-bold">
                <User className="size-4 text-primary" /> Neuer Kontakt
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="flex size-8 items-center justify-center rounded-full hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name *"
              autoFocus
              className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
            />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon"
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Stadt"
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
              />
            </div>

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse"
              className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
            />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notiz zum Kontakt (optional) / Shënim për kontaktin"
              rows={3}
              className="w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-base focus:border-primary focus:outline-none"
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <Button
                size="touch"
                className="flex-1"
                onClick={handleSave}
                disabled={isPending || !name.trim()}
              >
                {isPending ? "Speichert..." : "Speichern"}
              </Button>
              <Button size="touch" variant="outline" onClick={() => setShowForm(false)}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer list */}
      {customers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 size-10 opacity-40" />
            <p className="text-lg">Noch keine Kunden.</p>
            <p className="text-sm">Ende nuk ka klientë.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm font-semibold text-primary"
            >
              + Ersten Kontakt anlegen
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => {
            const activeProjects = c.projects?.filter((p) => p.status === "in_arbeit").length ?? 0
            const totalProjects = c.projects?.length ?? 0
            return (
              <Link key={c.id} href={`/kunden/${c.id}`}>
                <Card className="transition-all hover:border-primary/30 hover:shadow-sm">
                  <CardContent className="flex min-w-0 items-center gap-3 p-3 sm:gap-4 sm:p-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-base font-bold">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.city ?? c.phone ?? "—"}</p>
                      {c.notes && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground italic">{c.notes}</p>
                      )}
                      {totalProjects > 0 && (
                        <div className="mt-1 flex gap-1.5">
                          {activeProjects > 0 && (
                            <Badge className={cn("text-xs", "bg-primary/10 text-primary border-primary/20")}>
                              {activeProjects} aktiv
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {totalProjects} Aufträge
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} onClick={(e) => e.stopPropagation()}>
                          <div className="flex size-10 items-center justify-center rounded-full bg-muted hover:bg-accent">
                            <Phone className="size-4" />
                          </div>
                        </a>
                      )}
                      <ChevronRight className="size-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

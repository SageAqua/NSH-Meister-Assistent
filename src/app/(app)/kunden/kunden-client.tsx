"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, Check, ChevronRight, Loader2, Pencil, Phone, Plus, Trash2, User, Users, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { deleteCustomer, saveCustomer, updateCustomer } from "@/app/actions/orders"
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
  const [editing, setEditing] = useState<CustomerWithProjects | null>(null)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editCity, setEditCity] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editError, setEditError] = useState("")
  const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<CustomerWithProjects | null>(null)
  const [deleteError, setDeleteError] = useState("")

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
        setName("")
        setPhone("")
        setAddress("")
        setCity("")
        setNotes("")
        setShowForm(false)
        setError("")
        router.refresh()
      }
    })
  }

  function openEdit(customer: CustomerWithProjects) {
    setEditing(customer)
    setEditName(customer.name)
    setEditPhone(customer.phone ?? "")
    setEditAddress(customer.address ?? "")
    setEditCity(customer.city ?? "")
    setEditNotes(customer.notes ?? "")
    setEditError("")
  }

  function handleUpdate() {
    if (!editing || !editName.trim()) return
    setEditError("")
    setPendingCustomerId(editing.id)
    startTransition(async () => {
      const result = await updateCustomer({
        id: editing.id,
        name: editName,
        phone: editPhone,
        address: editAddress,
        city: editCity,
        notes: editNotes,
      })
      if (result?.error) {
        setEditError(result.error)
      } else {
        setEditing(null)
        router.refresh()
      }
      setPendingCustomerId(null)
    })
  }

  function openDelete(customer: CustomerWithProjects) {
    setDeleting(customer)
    setDeleteError("")
  }

  function handleDelete() {
    if (!deleting) return
    setDeleteError("")
    setPendingCustomerId(deleting.id)
    startTransition(async () => {
      const result = await deleteCustomer(deleting.id)
      if (result?.error) {
        setDeleteError(result.error)
      } else {
        setDeleting(null)
        router.refresh()
      }
      setPendingCustomerId(null)
    })
  }

  return (
    <div className="nsh-page max-w-5xl">
      <div className="nsh-page-header flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="nsh-eyebrow">
            <span className="nsh-i18n" data-sq="Kontakte">Kontakte</span>
          </p>
          <h1 className="nsh-title">
            <span className="nsh-i18n" data-sq="Klientë">Kunden</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            <span className="nsh-i18n" data-sq={`${customers.length} gjithsej`}>{customers.length} gesamt</span>
          </p>
        </div>
        <Button size="touch" className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          <span className="nsh-i18n nsh-i18n-button" data-sq="Kontakt i ri">Neuer Kontakt</span>
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-bold">
                <User className="size-4 text-primary" />
                <span className="nsh-i18n" data-sq="Kontakt i ri">Neuer Kontakt</span>
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="flex size-8 items-center justify-center rounded-lg hover:bg-accent"
                aria-label="Formular schließen / Mbyll formularin"
              >
                <X className="size-4" />
              </button>
            </div>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name *"
              autoFocus
              className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
            />
            <p className="-mt-2 text-xs text-muted-foreground">Emri *</p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Telefon"
                className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
              />
              <p className="-mt-1 text-xs text-muted-foreground sm:hidden">Telefoni</p>
              <input
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Stadt"
                className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
              />
            </div>
            <div className="-mt-2 hidden grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid">
              <p>Telefoni</p>
              <p>Qyteti</p>
            </div>

            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Adresse"
              className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
            />
            <p className="-mt-2 text-xs text-muted-foreground">Adresa</p>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notiz zum Kontakt (optional)"
              rows={3}
              className="w-full resize-none rounded-lg border-2 border-border bg-background p-3 text-base focus:border-primary focus:outline-none"
            />
            <p className="-mt-2 text-xs text-muted-foreground">Shënim për kontaktin (opsionale)</p>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <Button
                size="touch"
                className="flex-1"
                onClick={handleSave}
                disabled={isPending || !name.trim()}
              >
                <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={isPending ? "Duke ruajtur..." : "Ruaj"}>
                  {isPending ? "Speichert..." : "Speichern"}
                </span>
              </Button>
              <Button size="touch" variant="outline" onClick={() => setShowForm(false)}>
                <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq="Anulo">Abbrechen</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {customers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 size-10 opacity-40" />
            <p className="text-lg">
              <span className="nsh-i18n nsh-i18n-center" data-sq="Ende nuk ka klientë.">Noch keine Kunden.</span>
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm font-semibold text-primary"
            >
              <span className="nsh-i18n nsh-i18n-center" data-sq="+ Krijo kontaktin e parë">+ Ersten Kontakt anlegen</span>
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {customers.map((customer) => {
            const activeProjects = customer.projects?.filter((project) => project.status === "in_arbeit").length ?? 0
            const totalProjects = customer.projects?.length ?? 0

            return (
              <Card key={customer.id} className="transition-all hover:border-primary/30 hover:shadow-sm">
                <CardContent className="flex min-w-0 items-center gap-3 p-3 sm:gap-4 sm:p-4">
                  <Link href={`/kunden/${customer.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.city ?? customer.phone ?? "-"}</p>
                      {customer.notes && (
                        <p className="mt-0.5 truncate text-xs italic text-muted-foreground">{customer.notes}</p>
                      )}
                      {totalProjects > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {activeProjects > 0 && (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                              {activeProjects} aktiv
                            </span>
                          )}
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            {totalProjects} Aufträge
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                  </Link>
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted hover:bg-accent"
                      aria-label={`${customer.name} anrufen / telefono`}
                    >
                      <Phone className="size-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(customer)}
                    disabled={isPending}
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                    aria-label={`${customer.name} bearbeiten`}
                  >
                    {pendingCustomerId === customer.id ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openDelete(customer)}
                    disabled={isPending}
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    aria-label={`${customer.name} loeschen`}
                  >
                    {pendingCustomerId === customer.id && deleting?.id === customer.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur-sm sm:items-center sm:p-6 sm:pb-6"
          onClick={() => setEditing(null)}
        >
          <Card className="w-full max-w-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 shadow-2xl duration-200" onClick={(event) => event.stopPropagation()}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Pencil className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black leading-tight">
                      <span className="nsh-i18n" data-sq="Ndrysho klientin">Kunde bearbeiten</span>
                    </h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{editing.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-accent"
                  aria-label="Bearbeiten schliessen"
                >
                  <X className="size-4" />
                </button>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
                  <span className="nsh-i18n" data-sq="Emri">Name *</span>
                </span>
                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
                    <span className="nsh-i18n" data-sq="Telefoni">Telefon</span>
                  </span>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(event) => setEditPhone(event.target.value)}
                    className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
                    <span className="nsh-i18n" data-sq="Qyteti">Stadt</span>
                  </span>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(event) => setEditCity(event.target.value)}
                    className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
                  <span className="nsh-i18n" data-sq="Adresa">Adresse</span>
                </span>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(event) => setEditAddress(event.target.value)}
                  className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
                  <span className="nsh-i18n" data-sq="Shënim">Notiz</span>
                </span>
                <textarea
                  value={editNotes}
                  onChange={(event) => setEditNotes(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border-2 border-border bg-background p-3 text-base focus:border-primary focus:outline-none"
                />
              </label>

              {editError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-bold text-destructive">
                  {editError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button size="touch" variant="outline" onClick={() => setEditing(null)} disabled={isPending}>
                  Abbrechen
                </Button>
                <Button size="touch" className="gap-2" onClick={handleUpdate} disabled={isPending || !editName.trim()}>
                  {pendingCustomerId === editing.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Speichern
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {deleting && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur-sm sm:items-center sm:p-6 sm:pb-6"
          onClick={() => setDeleting(null)}
        >
          <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 shadow-2xl duration-200" onClick={(event) => event.stopPropagation()}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black leading-tight">
                    <span className="nsh-i18n" data-sq="Fshi klientin">Kunde löschen?</span>
                  </h3>
                  <p className="mt-2 break-words text-sm font-semibold">{deleting.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Baustellen bleiben erhalten, nur die Kunden-Verknüpfung wird entfernt.
                  </p>
                </div>
              </div>

              {deleteError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-bold text-destructive">
                  {deleteError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button size="touch" variant="outline" onClick={() => setDeleting(null)} disabled={isPending}>
                  Abbrechen
                </Button>
                <Button
                  size="touch"
                  variant="destructive"
                  className="gap-2 bg-destructive text-white hover:bg-destructive/90"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {pendingCustomerId === deleting.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

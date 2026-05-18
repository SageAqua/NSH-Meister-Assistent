"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, FileText, Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { deleteNote, saveNote, updateNote } from "@/app/actions/orders"
import type { Note } from "@/types"
import type { CustomerOption, ProjectOption } from "./page"
import { cn } from "@/lib/utils"

type NoteKind = "privat" | "kunden" | "baustellen"
type FilterKind = "alle" | NoteKind

const TYPE_COLORS: Record<NoteKind, string> = {
  privat: "bg-gray-100 text-gray-700",
  kunden: "bg-primary/10 text-primary",
  baustellen: "bg-orange-100 text-orange-700",
}

const TYPE_LABELS: Record<NoteKind, string> = {
  privat: "Privat",
  kunden: "Kunde",
  baustellen: "Baustelle",
}

const TYPE_LABELS_SQ: Record<NoteKind, string> = {
  privat: "Private",
  kunden: "Klient",
  baustellen: "Kantier",
}

function projectLabel(project: ProjectOption) {
  return `${project.customers?.name ?? "Unbekannt"} - ${project.address ?? project.service_type}`
}

function TypeSelector({
  value,
  onChange,
}: {
  value: NoteKind
  onChange: (value: NoteKind) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(["privat", "kunden", "baustellen"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-semibold transition-all",
            value === t ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
          )}
        >
          <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={TYPE_LABELS_SQ[t]}>
            {TYPE_LABELS[t]}
          </span>
        </button>
      ))}
    </div>
  )
}

function LinkSelectors({
  valueType,
  projects,
  customers,
  selectedProjectId,
  selectedCustomerId,
  onProjectChange,
  onCustomerChange,
}: {
  valueType: NoteKind
  projects: ProjectOption[]
  customers: CustomerOption[]
  selectedProjectId: string
  selectedCustomerId: string
  onProjectChange: (value: string) => void
  onCustomerChange: (value: string) => void
}) {
  return (
    <>
      {valueType === "kunden" && customers.length > 0 && (
        <select
          value={selectedCustomerId}
          onChange={(e) => onCustomerChange(e.target.value)}
          className="h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Kunde auswaehlen (optional)</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {valueType === "baustellen" && projects.length > 0 && (
        <select
          value={selectedProjectId}
          onChange={(e) => onProjectChange(e.target.value)}
          className="h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Baustelle auswaehlen (optional)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{projectLabel(p)}</option>
          ))}
        </select>
      )}
    </>
  )
}

export function NotizenClient({
  notes,
  projects,
  customers,
}: {
  notes: Note[]
  projects: ProjectOption[]
  customers: CustomerOption[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [filter, setFilter] = useState<FilterKind>("alle")
  const [showNew, setShowNew] = useState(false)
  const [content, setContent] = useState("")
  const [type, setType] = useState<NoteKind>("privat")
  const [projectId, setProjectId] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [formError, setFormError] = useState("")

  const [editing, setEditing] = useState<Note | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editType, setEditType] = useState<NoteKind>("privat")
  const [editProjectId, setEditProjectId] = useState("")
  const [editCustomerId, setEditCustomerId] = useState("")
  const [editError, setEditError] = useState("")

  const [deleting, setDeleting] = useState<Note | null>(null)
  const [deleteError, setDeleteError] = useState("")
  const [pendingNoteId, setPendingNoteId] = useState<string | null>(null)

  const filtered = filter === "alle" ? notes : notes.filter((n) => n.type === filter)

  function resetNewForm() {
    setContent("")
    setShowNew(false)
    setProjectId("")
    setCustomerId("")
    setFormError("")
  }

  function handleSave() {
    if (!content.trim()) return
    setFormError("")
    startTransition(async () => {
      const result = await saveNote(
        content.trim(),
        type,
        type === "baustellen" ? (projectId || undefined) : undefined,
        type === "kunden" ? (customerId || undefined) : undefined
      )
      if (result?.error) {
        setFormError(result.error)
      } else {
        resetNewForm()
        router.refresh()
      }
    })
  }

  function openEdit(note: Note) {
    setEditing(note)
    setEditContent(note.content)
    setEditType(note.type)
    setEditProjectId(note.project_id ?? "")
    setEditCustomerId(note.customer_id ?? "")
    setEditError("")
  }

  function handleUpdate() {
    if (!editing || !editContent.trim()) return
    setEditError("")
    setPendingNoteId(editing.id)
    startTransition(async () => {
      const result = await updateNote({
        id: editing.id,
        content: editContent,
        type: editType,
        projectId: editProjectId || undefined,
        customerId: editCustomerId || undefined,
      })
      if (result?.error) {
        setEditError(result.error)
      } else {
        setEditing(null)
        router.refresh()
      }
      setPendingNoteId(null)
    })
  }

  function openDelete(note: Note) {
    setDeleting(note)
    setDeleteError("")
  }

  function handleDelete() {
    if (!deleting) return
    setDeleteError("")
    setPendingNoteId(deleting.id)
    startTransition(async () => {
      const result = await deleteNote(deleting.id)
      if (result?.error) {
        setDeleteError(result.error)
      } else {
        setDeleting(null)
        router.refresh()
      }
      setPendingNoteId(null)
    })
  }

  return (
    <div className="nsh-page max-w-5xl">
      <div className="nsh-page-header flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="nsh-eyebrow">
            <span className="nsh-i18n" data-sq="Mbaj mend">Merken</span>
          </p>
          <h1 className="nsh-title">
            <span className="nsh-i18n" data-sq="Shënime">Notizen</span>
          </h1>
        </div>
        <Button size="touch" onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="size-4" />
          <span className="nsh-i18n nsh-i18n-button" data-sq="Shënim i ri">Neue Notiz</span>
        </Button>
      </div>

      {showNew && (
        <Card className="border-primary/30">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold">
                <span className="nsh-i18n" data-sq="Shënim i ri">Neue Notiz</span>
              </h3>
              <button onClick={() => setShowNew(false)} className="flex size-8 items-center justify-center rounded-full hover:bg-accent">
                <X className="size-4" />
              </button>
            </div>

            <TypeSelector value={type} onChange={setType} />
            <LinkSelectors
              valueType={type}
              projects={projects}
              customers={customers}
              selectedProjectId={projectId}
              selectedCustomerId={customerId}
              onProjectChange={setProjectId}
              onCustomerChange={setCustomerId}
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Notiz schreiben..."
              rows={4}
              className="w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-base focus:border-primary focus:outline-none"
            />
            <p className="-mt-2 text-xs text-muted-foreground">Shkruaj shënimin...</p>

            {formError && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-bold text-destructive">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <Button size="touch" className="flex-1" onClick={handleSave} disabled={isPending || !content.trim()}>
                <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={isPending ? "Duke ruajtur..." : "Ruaj"}>
                  {isPending ? "Speichert..." : "Speichern"}
                </span>
              </Button>
              <Button size="touch" variant="outline" onClick={() => setShowNew(false)}>
                <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq="Anulo">Abbrechen</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {(["alle", "privat", "kunden", "baustellen"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
            )}
          >
            <span className="nsh-i18n nsh-i18n-center nsh-i18n-button" data-sq={f === "alle" ? "Të gjitha" : TYPE_LABELS_SQ[f]}>
              {f === "alle" ? "Alle" : TYPE_LABELS[f]}
            </span>
            {f !== "alle" && <span className="ml-1.5 text-xs opacity-70">({notes.filter((n) => n.type === f).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 size-10 opacity-40" />
            <p className="text-lg">
              <span className="nsh-i18n nsh-i18n-center" data-sq="Nuk ka shënime.">Keine Notizen.</span>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtered.map((note) => {
            const pendingThis = pendingNoteId === note.id
            return (
              <Card key={note.id} className="transition-colors hover:border-primary/30">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <Badge className={cn("border text-xs", TYPE_COLORS[note.type])}>
                      <span className="nsh-i18n" data-sq={TYPE_LABELS_SQ[note.type]}>{TYPE_LABELS[note.type]}</span>
                    </Badge>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title="Notiz bearbeiten"
                        aria-label="Notiz bearbeiten"
                        onClick={() => openEdit(note)}
                        disabled={isPending}
                        className="flex size-8 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                      >
                        {pendingThis && editing?.id === note.id ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
                      </button>
                      <button
                        type="button"
                        title="Notiz loeschen"
                        aria-label="Notiz loeschen"
                        onClick={() => openDelete(note)}
                        disabled={isPending}
                        className="flex size-8 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                      >
                        {pendingThis && deleting?.id === note.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap text-base">{note.content}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{new Date(note.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {note.customers && <span>Kunde: {note.customers.name}</span>}
                    {note.projects && (
                      <span>
                        Baustelle: {note.projects.customers?.name ?? ""} - {note.projects.address ?? note.projects.service_type}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setEditing(null)}
        >
          <Card className="w-full max-w-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 shadow-2xl duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Pencil className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-black leading-tight">
                      <span className="nsh-i18n" data-sq="Ndrysho shënimin">Notiz bearbeiten</span>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(editing.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <button onClick={() => setEditing(null)} className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-accent">
                  <X className="size-4" />
                </button>
              </div>

              <TypeSelector value={editType} onChange={setEditType} />
              <LinkSelectors
                valueType={editType}
                projects={projects}
                customers={customers}
                selectedProjectId={editProjectId}
                selectedCustomerId={editCustomerId}
                onProjectChange={setEditProjectId}
                onCustomerChange={setEditCustomerId}
              />

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-base focus:border-primary focus:outline-none"
              />

              {editError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-bold text-destructive">
                  {editError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button size="touch" variant="outline" onClick={() => setEditing(null)} disabled={isPending}>
                  Abbrechen
                </Button>
                <Button size="touch" className="gap-2" onClick={handleUpdate} disabled={isPending || !editContent.trim()}>
                  {pendingNoteId === editing.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Speichern
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setDeleting(null)}
        >
          <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 shadow-2xl duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black leading-tight">
                    <span className="nsh-i18n" data-sq="Fshi shënimin">Notiz löschen?</span>
                  </h3>
                  <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{deleting.content}</p>
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
                  {pendingNoteId === deleting.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
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

"use client"

import { useState, useTransition } from "react"
import { FileText, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { saveNote } from "@/app/actions/orders"
import type { Note } from "@/types"
import type { ProjectOption, CustomerOption } from "./page"
import { cn } from "@/lib/utils"

const TYPE_COLORS: Record<string, string> = {
  privat: "bg-gray-100 text-gray-700",
  kunden: "bg-primary/10 text-primary",
  baustellen: "bg-orange-100 text-orange-700",
}
const TYPE_LABELS: Record<string, string> = {
  privat: "Privat", kunden: "Kunde", baustellen: "Baustelle"
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
  const [filter, setFilter] = useState<"alle" | "privat" | "kunden" | "baustellen">("alle")
  const [showNew, setShowNew] = useState(false)
  const [content, setContent] = useState("")
  const [type, setType] = useState<"privat" | "kunden" | "baustellen">("privat")
  const [projectId, setProjectId] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [isPending, startTransition] = useTransition()

  const filtered = filter === "alle" ? notes : notes.filter((n) => n.type === filter)

  function handleSave() {
    if (!content.trim()) return
    startTransition(async () => {
      await saveNote(
        content,
        type,
        type === "baustellen" ? (projectId || undefined) : undefined,
        type === "kunden" ? (customerId || undefined) : undefined
      )
      setContent("")
      setShowNew(false)
      setProjectId("")
      setCustomerId("")
    })
  }

  return (
    <div className="w-full max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Notizen <span className="text-muted-foreground font-normal text-lg">/ Shënime</span></h1>
        <Button size="touch" onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="size-4" /> Neue Notiz
        </Button>
      </div>

      {/* New note form */}
      {showNew && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold">Neue Notiz</h3>
              <button onClick={() => setShowNew(false)} className="flex size-8 items-center justify-center rounded-full hover:bg-accent">
                <X className="size-4" />
              </button>
            </div>

            {/* Type */}
            <div className="flex flex-wrap gap-2">
              {(["privat", "kunden", "baustellen"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-semibold transition-all",
                    type === t ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
                  )}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Link to customer */}
            {type === "kunden" && customers.length > 0 && (
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Kunde auswählen (optional)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {/* Link to project */}
            {type === "baustellen" && projects.length > 0 && (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Baustelle auswählen (optional)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.customers?.name ?? "Unbekannt"} — {p.address ?? p.service_type}
                  </option>
                ))}
              </select>
            )}

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Notiz schreiben... / Shkruaj shënimin..."
              rows={4}
              className="w-full rounded-xl border-2 border-border bg-background p-3 text-base focus:border-primary focus:outline-none resize-none"
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <Button size="touch" className="flex-1" onClick={handleSave} disabled={isPending || !content.trim()}>
                {isPending ? "Speichert..." : "Speichern"}
              </Button>
              <Button size="touch" variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
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
            {f === "alle" ? "Alle" : TYPE_LABELS[f]}
            {f !== "alle" && <span className="ml-1.5 text-xs opacity-70">({notes.filter((n) => n.type === f).length})</span>}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 size-10 opacity-40" />
            <p className="text-lg">Keine Notizen.</p>
            <p className="text-sm">Nuk ka shënime.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => (
            <Card key={note.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={cn("text-xs border", TYPE_COLORS[note.type])}>
                    {TYPE_LABELS[note.type]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-base whitespace-pre-wrap">{note.content}</p>
                {note.customers && (
                  <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    👤 {note.customers.name}
                  </p>
                )}
                {note.projects && (
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    📍 {note.projects.customers?.name ?? ""} — {note.projects.address ?? note.projects.service_type}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { FileText, Trash2, ExternalLink, ScanLine, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { deleteDocument } from "@/app/actions/documents"
import { DocumentScannerSheet } from "@/components/scanner/DocumentScannerSheet"
import { createClient } from "@/lib/supabase/client"
import type { DocumentRecord, DocType, DocDirection } from "@/types"

const DOC_TYPE_COLORS: Record<DocType, string> = {
  rechnung: "bg-blue-100 text-blue-700 border-blue-200",
  kassenbon: "bg-amber-100 text-amber-700 border-amber-200",
  angebot: "bg-violet-100 text-violet-700 border-violet-200",
  lieferschein: "bg-cyan-100 text-cyan-700 border-cyan-200",
  vertrag: "bg-rose-100 text-rose-700 border-rose-200",
  foto: "bg-green-100 text-green-700 border-green-200",
  sonstiges: "bg-gray-100 text-gray-600 border-gray-200",
}

const DOC_TYPE_LABELS: Record<DocType, string> = {
  rechnung: "Rechnung", kassenbon: "Kassenbon", angebot: "Angebot",
  lieferschein: "Lieferschein", vertrag: "Vertrag", foto: "Foto", sonstiges: "Sonstiges",
}

const FILTER_TABS: { key: "alle" | DocType; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "rechnung", label: "Rechnungen" },
  { key: "kassenbon", label: "Kassenbons" },
  { key: "angebot", label: "Angebote" },
  { key: "sonstiges", label: "Sonstiges" },
]

function formatCurrency(amount: number | null) {
  if (amount === null) return "—"
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

function DocumentCard({ doc, onDelete }: { doc: DocumentRecord; onDelete: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function openDoc() {
    const supabase = createClient()
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, "_blank")
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      await deleteDocument(doc.id)
      onDelete()
    })
  }

  const displayName = doc.suggested_filename ?? doc.original_filename
  const isEinnahme = doc.doc_direction === "einnahme"

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Type + direction badges */}
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold", DOC_TYPE_COLORS[doc.doc_type])}>
          {DOC_TYPE_LABELS[doc.doc_type]}
        </span>
        <span className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
          isEinnahme ? "border-green-200 bg-green-50 text-green-700" : "border-orange-200 bg-orange-50 text-orange-700"
        )}>
          {isEinnahme ? "↑ Einnahme" : "↓ Ausgabe"}
        </span>
      </div>

      {/* File icon + name */}
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileCheck className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
          {doc.vendor && <p className="truncate text-xs text-muted-foreground">{doc.vendor}</p>}
        </div>
      </div>

      {/* Amount + date */}
      <div className="mb-4 flex items-center justify-between">
        <span className={cn("text-base font-black", isEinnahme ? "text-green-600" : "text-foreground")}>
          {isEinnahme ? "+" : ""}{formatCurrency(doc.amount_gross)}
        </span>
        <span className="text-xs text-muted-foreground">{formatDate(doc.document_date || doc.created_at)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={openDoc}>
          <ExternalLink className="size-3.5" />
          Öffnen
        </Button>
        <Button
          size="sm"
          variant={confirmDelete ? "destructive" : "ghost"}
          className="gap-1.5"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="size-3.5" />
          {confirmDelete ? "Sicher?" : ""}
        </Button>
      </div>
    </div>
  )
}

export function DokumenteClient({ documents: initialDocs }: { documents: DocumentRecord[] }) {
  const [docs, setDocs] = useState(initialDocs)
  const [activeFilter, setActiveFilter] = useState<"alle" | DocType>("alle")
  const [direction, setDirection] = useState<"alle" | DocDirection>("alle")
  const [scannerOpen, setScannerOpen] = useState(false)

  const filtered = docs.filter((d) => {
    if (activeFilter !== "alle" && d.doc_type !== activeFilter) return false
    if (direction !== "alle" && d.doc_direction !== direction) return false
    return true
  })

  return (
    <div className="nsh-page">
      <div className="nsh-page-header flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="nsh-eyebrow">Verwaltung</p>
          <h1 className="nsh-title">Dokumente</h1>
          <p className="nsh-subtitle">{docs.length} gespeicherte Dokumente</p>
        </div>
        <Button size="touch" className="gap-2" onClick={() => setScannerOpen(true)}>
          <ScanLine className="size-4" />
          Scannen
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors",
              activeFilter === tab.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Direction toggle */}
      <div className="flex gap-2">
        {(["alle", "einnahme", "ausgabe"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
              direction === d
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {d === "alle" ? "Alle" : d === "einnahme" ? "↑ Einnahmen" : "↓ Ausgaben"}
          </button>
        ))}
      </div>

      {/* Documents grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <FileText className="mx-auto mb-3 size-12 text-muted-foreground/40" />
          <p className="text-base font-bold text-muted-foreground">
            {docs.length === 0 ? "Noch keine Dokumente." : "Keine Ergebnisse für diesen Filter."}
          </p>
          {docs.length === 0 && (
            <Button size="touch" className="mt-4 gap-2" onClick={() => setScannerOpen(true)}>
              <ScanLine className="size-4" />
              Erstes Dokument scannen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={() => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
            />
          ))}
        </div>
      )}

      <DocumentScannerSheet open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  )
}

"use client"

import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DocumentAnalysis, DocType, DocDirection, DocCategory } from "@/types"

const DOC_TYPE_LABELS: Record<DocType, string> = {
  rechnung: "Rechnung", kassenbon: "Kassenbon", angebot: "Angebot",
  lieferschein: "Lieferschein", vertrag: "Vertrag", foto: "Foto", sonstiges: "Sonstiges",
}

const DOC_TYPES: DocType[] = ["rechnung", "kassenbon", "angebot", "lieferschein", "vertrag", "sonstiges"]

const CATEGORY_LABELS: Record<DocCategory, string> = {
  material: "Material", tanken: "Tanken", werkzeug: "Werkzeug",
  buero: "Büro", essen: "Essen", versicherung: "Versicherung",
  lohn: "Lohn", sonstiges: "Sonstiges",
}
const CATEGORIES: DocCategory[] = ["material", "tanken", "werkzeug", "buero", "essen", "versicherung", "lohn", "sonstiges"]

interface Props {
  file: File
  previewUrl: string | null
  analysis: DocumentAnalysis
  onChange: (updated: Partial<DocumentAnalysis>) => void
}

export function FilePreviewCard({ file, previewUrl, analysis, onChange }: Props) {
  const isImage = file.type.startsWith("image/")
  const fileSizeKb = Math.round(file.size / 1024)
  const isOffer = analysis.doc_type === "angebot"

  function handleDocTypeChange(docType: DocType) {
    if (docType === "angebot") {
      onChange({ doc_type: docType, doc_direction: null, category: null })
      return
    }

    const nextDirection = analysis.doc_direction ?? "ausgabe"

    onChange({
      doc_type: docType,
      doc_direction: nextDirection,
      category: nextDirection === "ausgabe" ? analysis.category ?? "sonstiges" : null,
    })
  }

  return (
    <div className="space-y-4">
      {/* Thumbnail */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
        {isImage && previewUrl ? (
          <img src={previewUrl} alt="Vorschau" className="h-16 w-16 rounded-lg object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-8 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">{fileSizeKb} KB</p>
          {analysis.suggested_filename && (
            <p className="mt-0.5 truncate text-xs font-semibold text-primary">{analysis.suggested_filename}.pdf</p>
          )}
        </div>
      </div>

      {/* AI-extracted data — editable */}
      <div className="space-y-3">
        {/* Doc type */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Dokumenttyp</p>
          <div className="flex flex-wrap gap-1.5">
            {DOC_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleDocTypeChange(t)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
                  analysis.doc_type === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted"
                )}
              >
                {DOC_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Direction */}
        {isOffer ? (
          <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
            Angebot: keine Einnahme / Ausgabe
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Richtung</p>
            <div className="grid grid-cols-2 gap-2">
              {(["einnahme", "ausgabe"] as DocDirection[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onChange({
                    doc_direction: d,
                    category: d === "ausgabe" ? analysis.category ?? "sonstiges" : null,
                  })}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-bold transition-colors",
                    analysis.doc_direction === d
                      ? d === "einnahme" ? "border-green-500 bg-green-50 text-green-700"
                        : "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {d === "einnahme" ? "↑ Einnahme" : "↓ Ausgabe"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category (only for Ausgabe) */}
        {analysis.doc_direction === "ausgabe" && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Kategorie</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ category: c })}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
                    analysis.category === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Extracted amounts */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Betrag brutto (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={analysis.amount_gross ?? ""}
              onChange={(e) => onChange({ amount_gross: e.target.value ? Number(e.target.value) : null })}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Datum
            </label>
            <input
              type="date"
              value={analysis.document_date ?? ""}
              onChange={(e) => onChange({ document_date: e.target.value || null })}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Vendor */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {analysis.doc_direction === "einnahme" || isOffer ? "Kunde" : "Lieferant / Händler"}
          </label>
          <input
            type="text"
            value={analysis.vendor ?? ""}
            onChange={(e) => onChange({ vendor: e.target.value || null })}
            placeholder="z.B. Bauhaus, OBI, Shell..."
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  )
}

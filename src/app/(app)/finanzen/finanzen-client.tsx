"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Euro, Receipt, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DocumentRecord, DocCategory } from "@/types"

const CATEGORY_LABELS: Record<DocCategory, string> = {
  material: "Material", tanken: "Tanken", werkzeug: "Werkzeug",
  buero: "Büro", essen: "Essen", versicherung: "Versicherung",
  lohn: "Lohn", sonstiges: "Sonstiges",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

function SummaryCard({
  label, value, sub, icon: Icon, colorClass, trend,
}: {
  label: string; value: string; sub?: string
  icon: typeof Euro; colorClass: string; trend?: "up" | "down"
}) {
  return (
    <div className={cn("rounded-2xl border p-4", colorClass)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</p>
        <Icon className="size-4 opacity-70" />
      </div>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-70">{sub}</p>}
    </div>
  )
}

interface CategoryRow { category: string; count: number; total: number }

export function FinanzenClient({ documents, currentYear }: { documents: DocumentRecord[]; currentYear: number }) {
  const [activeTab, setActiveTab] = useState<"uebersicht" | "einnahmen" | "ausgaben">("uebersicht")

  const einnahmen = documents.filter((d) => d.doc_direction === "einnahme")
  const ausgaben = documents.filter((d) => d.doc_direction === "ausgabe")

  const sumGross = (docs: DocumentRecord[]) =>
    docs.reduce((acc, d) => acc + (d.amount_gross ?? 0), 0)
  const sumVat = (docs: DocumentRecord[]) =>
    docs.reduce((acc, d) => acc + (d.amount_vat ?? 0), 0)

  const umsatz = sumGross(einnahmen)
  const ausgabenTotal = sumGross(ausgaben)
  const gewinn = umsatz - ausgabenTotal
  const ustEinnahmen = sumVat(einnahmen)
  const vorsteuer = sumVat(ausgaben)
  const ustZahllast = ustEinnahmen - vorsteuer

  // Category breakdown for Ausgaben
  const categoryMap: Record<string, CategoryRow> = {}
  ausgaben.forEach((d) => {
    const key = d.category ?? "sonstiges"
    if (!categoryMap[key]) categoryMap[key] = { category: key, count: 0, total: 0 }
    categoryMap[key].count++
    categoryMap[key].total += d.amount_gross ?? 0
  })
  const categoryRows = Object.values(categoryMap).sort((a, b) => b.total - a.total)

  const tabs = [
    { key: "uebersicht" as const, label: "Übersicht" },
    { key: "einnahmen" as const, label: `Einnahmen (${einnahmen.length})` },
    { key: "ausgaben" as const, label: `Ausgaben (${ausgaben.length})` },
  ]

  return (
    <div className="nsh-page">
      <div className="nsh-page-header">
        <p className="nsh-eyebrow">Finanzen {currentYear}</p>
        <h1 className="nsh-title">Finanzübersicht</h1>
        <p className="nsh-subtitle">Einnahmen, Ausgaben & Umsatzsteuer</p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Umsatz" value={formatCurrency(umsatz)}
          sub={`${einnahmen.length} Einnahmen`}
          icon={TrendingUp}
          colorClass="border-blue-200 bg-blue-50 text-blue-800"
        />
        <SummaryCard
          label="Ausgaben" value={formatCurrency(ausgabenTotal)}
          sub={`${ausgaben.length} Belege`}
          icon={TrendingDown}
          colorClass="border-orange-200 bg-orange-50 text-orange-800"
        />
        <SummaryCard
          label="Gewinn (brutto)" value={formatCurrency(gewinn)}
          sub={gewinn >= 0 ? "Positiv" : "Defizit"}
          icon={Euro}
          colorClass={gewinn >= 0
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"}
        />
        <SummaryCard
          label="USt-Zahllast" value={formatCurrency(ustZahllast)}
          sub={`${formatCurrency(ustEinnahmen)} − ${formatCurrency(vorsteuer)}`}
          icon={Receipt}
          colorClass="border-violet-200 bg-violet-50 text-violet-800"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition-colors",
              activeTab === tab.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Übersicht tab */}
      {activeTab === "uebersicht" && (
        <div className="space-y-5">
          {/* USt detail box */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-sm font-black text-foreground">Umsatzsteuer Detail</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">USt aus Einnahmen (abzuführen)</span>
                <span className="font-bold text-foreground">{formatCurrency(ustEinnahmen)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vorsteuer aus Ausgaben (abziehbar)</span>
                <span className="font-bold text-green-600">− {formatCurrency(vorsteuer)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-bold text-foreground">USt-Zahllast (ans Finanzamt)</span>
                <span className={cn("font-black", ustZahllast >= 0 ? "text-foreground" : "text-green-600")}>
                  {formatCurrency(ustZahllast)}
                </span>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          {categoryRows.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-sm font-black text-foreground">Ausgaben nach Kategorie</p>
              <div className="space-y-2">
                {categoryRows.map((row) => (
                  <div key={row.category} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-foreground">
                          {CATEGORY_LABELS[row.category as DocCategory] ?? row.category}
                        </span>
                        <span className="font-bold text-foreground">{formatCurrency(row.total)}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${Math.min((row.total / ausgabenTotal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{row.count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Einnahmen tab */}
      {activeTab === "einnahmen" && (
        <div className="rounded-xl border border-border bg-card">
          {einnahmen.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="mb-2 size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Noch keine Einnahmen erfasst.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Datum</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Kunde</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">Brutto</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">USt</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Beleg-Nr.</th>
                  </tr>
                </thead>
                <tbody>
                  {einnahmen.map((d, i) => (
                    <tr key={d.id} className={i < einnahmen.length - 1 ? "border-b border-border/50" : ""}>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(d.document_date)}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{d.vendor ?? d.recipient ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(d.amount_gross ?? 0)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(d.amount_vat ?? 0)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.document_number ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/30">
                    <td colSpan={2} className="px-4 py-3 font-black text-foreground">Gesamt</td>
                    <td className="px-4 py-3 text-right font-black text-green-600">{formatCurrency(umsatz)}</td>
                    <td className="px-4 py-3 text-right font-bold text-muted-foreground">{formatCurrency(ustEinnahmen)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Ausgaben tab */}
      {activeTab === "ausgaben" && (
        <div className="rounded-xl border border-border bg-card">
          {ausgaben.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="mb-2 size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Noch keine Ausgaben erfasst.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Datum</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Lieferant</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">Brutto</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Kategorie</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Beleg-Nr.</th>
                  </tr>
                </thead>
                <tbody>
                  {ausgaben.map((d, i) => (
                    <tr key={d.id} className={i < ausgaben.length - 1 ? "border-b border-border/50" : ""}>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(d.document_date)}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{d.vendor ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(d.amount_gross ?? 0)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {CATEGORY_LABELS[d.category as DocCategory] ?? d.category ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.document_number ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/30">
                    <td colSpan={2} className="px-4 py-3 font-black text-foreground">Gesamt</td>
                    <td className="px-4 py-3 text-right font-black text-foreground">{formatCurrency(ausgabenTotal)}</td>
                    <td colSpan={2} className="px-4 py-3 text-xs text-muted-foreground">Vorsteuer: {formatCurrency(vorsteuer)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

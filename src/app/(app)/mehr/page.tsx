import Link from "next/link"
import { Calculator, FileText, Users, BookOpen, Package, Settings, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const MORE_ITEMS = [
  {
    href: "/preisrechner",
    icon: Calculator,
    labelDe: "Preisrechner",
    labelSq: "Kalkulatori",
    desc: "Schnell Preise berechnen",
    color: "bg-orange-100 text-orange-700",
  },
  {
    href: "/notizen",
    icon: FileText,
    labelDe: "Notizen",
    labelSq: "Shenime",
    desc: "Privat, Kunden oder Baustellen",
    color: "bg-blue-100 text-blue-700",
  },
  {
    href: "/kunden",
    icon: Users,
    labelDe: "Kunden",
    labelSq: "Klientet",
    desc: "Alle Kontakte verwalten",
    color: "bg-green-100 text-green-700",
  },
  {
    href: "/deutsch-lernen",
    icon: BookOpen,
    labelDe: "Deutsch lernen",
    labelSq: "Meso Gjermanisht",
    desc: "Flashcards mit Beispielsatzen",
    color: "bg-purple-100 text-purple-700",
  },
  {
    href: "/material",
    icon: Package,
    labelDe: "Material",
    labelSq: "Materiali",
    desc: "Materiallisten pro Baustelle",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    href: "/einstellungen",
    icon: Settings,
    labelDe: "Einstellungen",
    labelSq: "Cilesimet",
    desc: "App-Einstellungen & Konto",
    color: "bg-gray-100 text-gray-700",
  },
]

export default function MehrPage() {
  return (
    <div className="nsh-page">
      <div className="nsh-page-header">
        <p className="nsh-eyebrow">Werkzeuge</p>
        <h1 className="nsh-title">Mehr</h1>
        <p className="nsh-subtitle">Weitere Funktionen für Preise, Notizen, Material und Lernen.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {MORE_ITEMS.map(({ href, icon: Icon, labelDe, labelSq, desc, color }) => (
          <Link key={href} href={href}>
            <Card className="transition-all hover:border-primary/30 hover:shadow-sm">
              <CardContent className="flex min-h-28 min-w-0 items-center gap-3 p-4">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold">{labelDe}</p>
                  <p className="text-xs text-muted-foreground">{labelSq} - {desc}</p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

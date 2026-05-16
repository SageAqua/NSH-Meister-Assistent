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
    labelSq: "Shënime",
    desc: "Privat, Kunden oder Baustellen",
    color: "bg-blue-100 text-blue-700",
  },
  {
    href: "/kunden",
    icon: Users,
    labelDe: "Kunden",
    labelSq: "Klientët",
    desc: "Alle Kontakte verwalten",
    color: "bg-green-100 text-green-700",
  },
  {
    href: "/deutsch-lernen",
    icon: BookOpen,
    labelDe: "Deutsch lernen",
    labelSq: "Mëso Gjermanisht",
    desc: "Flashcards mit Beispielsätzen",
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
    labelSq: "Cilësimet",
    desc: "App-Einstellungen & Konto",
    color: "bg-gray-100 text-gray-700",
  },
]

export default function MehrPage() {
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Mehr</h1>
        <p className="text-muted-foreground text-sm">Më shumë — Weitere Funktionen</p>
      </div>

      <div className="space-y-2">
        {MORE_ITEMS.map(({ href, icon: Icon, labelDe, labelSq, desc, color }) => (
          <Link key={href} href={href}>
            <Card className="transition-all hover:border-primary/30 hover:shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="size-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base">{labelDe}</p>
                  <p className="text-xs text-muted-foreground">{labelSq} · {desc}</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

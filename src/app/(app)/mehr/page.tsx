import Link from "next/link"
import { Calculator, FileText, Users, BookOpen, Package, Settings, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const MORE_ITEMS = [
  {
    href: "/preisrechner",
    icon: Calculator,
    labelDe: "Preisrechner",
    labelSq: "Llogaritësi i çmimeve",
    desc: "Schnell Preise berechnen",
    descSq: "Llogarit çmimet shpejt",
    color: "bg-orange-100 text-orange-700",
  },
  {
    href: "/notizen",
    icon: FileText,
    labelDe: "Notizen",
    labelSq: "Shënime",
    desc: "Privat, Kunden oder Baustellen",
    descSq: "Privat, klientë ose kantiere",
    color: "bg-blue-100 text-blue-700",
  },
  {
    href: "/kunden",
    icon: Users,
    labelDe: "Kunden",
    labelSq: "Klientë",
    desc: "Alle Kontakte verwalten",
    descSq: "Menaxho të gjitha kontaktet",
    color: "bg-green-100 text-green-700",
  },
  {
    href: "/deutsch-lernen",
    icon: BookOpen,
    labelDe: "Deutsch lernen",
    labelSq: "Mëso gjermanisht",
    desc: "Flashcards mit Beispielsatzen",
    descSq: "Karta mësimi me fjali shembull",
    color: "bg-purple-100 text-purple-700",
  },
  {
    href: "/material",
    icon: Package,
    labelDe: "Material",
    labelSq: "Materiali",
    desc: "Materiallisten pro Baustelle",
    descSq: "Lista materialesh për çdo kantier",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    href: "/einstellungen",
    icon: Settings,
    labelDe: "Einstellungen",
    labelSq: "Cilësime",
    desc: "App-Einstellungen & Konto",
    descSq: "Cilësimet e app-it dhe llogaria",
    color: "bg-gray-100 text-gray-700",
  },
]

export default function MehrPage() {
  return (
    <div className="nsh-page">
      <div className="nsh-page-header">
        <p className="nsh-eyebrow">
          <span className="nsh-i18n" data-sq="Mjete">Werkzeuge</span>
        </p>
        <h1 className="nsh-title">
          <span className="nsh-i18n" data-sq="Më shumë">Mehr</span>
        </h1>
        <p className="nsh-subtitle">
          <span className="nsh-i18n" data-sq="Funksione të tjera për çmime, shënime, materiale dhe mësim.">Weitere Funktionen für Preise, Notizen, Material und Lernen.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {MORE_ITEMS.map(({ href, icon: Icon, labelDe, labelSq, desc, descSq, color }) => (
          <Link key={href} href={href}>
            <Card className="transition-all hover:border-primary/30 hover:shadow-sm">
              <CardContent className="flex min-h-28 min-w-0 items-center gap-3 p-4">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold">{labelDe}</p>
                  <p className="text-xs text-muted-foreground">{labelSq}</p>
                  <p className="mt-1 text-xs font-semibold text-foreground">{desc}</p>
                  <p className="text-xs text-muted-foreground">{descSq}</p>
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

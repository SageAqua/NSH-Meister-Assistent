import Link from "next/link"
import { BriefcaseBusiness, Building2, CalendarPlus2, User } from "lucide-react"

export default async function NeuerAuftragPage() {
  return (
    <div className="min-h-[calc(100dvh-5.5rem)] w-full">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center p-4 sm:p-6">
        <p className="nsh-eyebrow">Schnell starten</p>
        <h1 className="nsh-title">Was willst du jetzt eintragen?</h1>
        <p className="nsh-subtitle">
          Einfach tippen und los. / Prek dhe fillo.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link href="/heute?new-event=1&type=privat" className="rounded-2xl border border-violet-300 bg-violet-50 p-5 transition-colors hover:bg-violet-100">
            <User className="size-7 text-violet-700" />
            <p className="mt-3 text-lg font-black text-violet-900">Privat Termin</p>
            <p className="text-sm text-violet-700">Termin privat</p>
          </Link>
          <Link href="/heute?new-event=1&type=arbeit" className="rounded-2xl border border-blue-300 bg-blue-50 p-5 transition-colors hover:bg-blue-100">
            <BriefcaseBusiness className="size-7 text-blue-700" />
            <p className="mt-3 text-lg font-black text-blue-900">Work Termin</p>
            <p className="text-sm text-blue-700">Termin pune</p>
          </Link>
          <Link href="/heute?new-event=1&type=baustelle" className="rounded-2xl border border-amber-300 bg-amber-50 p-5 transition-colors hover:bg-amber-100">
            <Building2 className="size-7 text-amber-700" />
            <p className="mt-3 text-lg font-black text-amber-900">Baustelle planen</p>
            <p className="text-sm text-amber-700">Planifiko kantierin</p>
          </Link>
        </div>

        <Link href="/kalender" className="mt-4 inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-bold hover:bg-accent w-fit">
          <CalendarPlus2 className="size-4" /> Monat ansehen / Shiko muajin
        </Link>
      </div>
    </div>
  )
}

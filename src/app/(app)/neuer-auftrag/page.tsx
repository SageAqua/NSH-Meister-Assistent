import Link from "next/link"
import { BriefcaseBusiness, Building2, User } from "lucide-react"

export default async function NeuerAuftragPage() {
  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] w-full flex-col justify-center p-4 sm:p-6">
      <div className="mx-auto w-full max-w-5xl">
        <p className="nsh-eyebrow">Schnell starten / Fillo shpejt</p>
        <h1 className="nsh-title mt-1">Was willst du eintragen?</h1>
        <p className="nsh-subtitle">Waehle den Typ und fuell das Formular aus.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link
            href="/neuer-auftrag/privat"
            className="nsh-card-tap flex min-h-36 flex-col justify-between rounded-2xl border-2 border-violet-300 bg-violet-50 p-6 hover:bg-violet-100 sm:min-h-44"
          >
            <User className="size-12 text-violet-700" />
            <div>
              <p className="text-2xl font-black text-violet-900">Privat Termin</p>
              <p className="mt-1 text-base text-violet-700">Arzt, Familie, Persoenliches</p>
            </div>
          </Link>

          <Link
            href="/neuer-auftrag/arbeit"
            className="nsh-card-tap flex min-h-36 flex-col justify-between rounded-2xl border-2 border-blue-300 bg-blue-50 p-6 hover:bg-blue-100 sm:min-h-44"
          >
            <BriefcaseBusiness className="size-12 text-blue-700" />
            <div>
              <p className="text-2xl font-black text-blue-900">Work Termin</p>
              <p className="mt-1 text-base text-blue-700">Kundentermin, Besichtigung</p>
            </div>
          </Link>

          <Link
            href="/neuer-auftrag/baustelle"
            className="nsh-card-tap flex min-h-36 flex-col justify-between rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 hover:bg-amber-100 sm:min-h-44"
          >
            <Building2 className="size-12 text-amber-700" />
            <div>
              <p className="text-2xl font-black text-amber-900">Baustelle planen</p>
              <p className="mt-1 text-base text-amber-700">Auftrag, Projekt, Renovierung</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { BriefcaseBusiness, Building2, User } from "lucide-react"

export default async function NeuerAuftragPage() {
  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] w-full flex-col justify-center p-4 sm:p-6 md:justify-start md:pt-8">
      <div className="mx-auto w-full max-w-5xl">
        <p className="nsh-eyebrow">
          <span className="nsh-i18n" data-sq="Fillo shpejt">Schnell starten</span>
        </p>
        <h1 className="nsh-title mt-1">
          <span className="nsh-i18n" data-sq="Çfarë do të regjistrosh?">Was willst du eintragen?</span>
        </h1>
        <p className="nsh-subtitle">
          <span className="nsh-i18n" data-sq="Zgjidh llojin dhe plotëso formularin.">Wähle den Typ und füll das Formular aus.</span>
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link
            href="/neuer-auftrag/privat"
            className="nsh-card-tap flex min-h-36 flex-col justify-between rounded-2xl border-2 border-violet-300 bg-violet-50 p-6 hover:bg-violet-100 sm:min-h-44"
          >
            <User className="size-12 text-violet-700" />
            <div>
              <p className="text-2xl font-black text-violet-900">
                <span className="nsh-i18n" data-sq="Termin privat">Privat Termin</span>
              </p>
              <p className="mt-1 text-base text-violet-700">
                <span className="nsh-i18n" data-sq="Mjek, familje, personale">Arzt, Familie, Persönliches</span>
              </p>
            </div>
          </Link>

          <Link
            href="/neuer-auftrag/arbeit"
            className="nsh-card-tap flex min-h-36 flex-col justify-between rounded-2xl border-2 border-blue-300 bg-blue-50 p-6 hover:bg-blue-100 sm:min-h-44"
          >
            <BriefcaseBusiness className="size-12 text-blue-700" />
            <div>
              <p className="text-2xl font-black text-blue-900">
                <span className="nsh-i18n" data-sq="Termin pune">Work Termin</span>
              </p>
              <p className="mt-1 text-base text-blue-700">
                <span className="nsh-i18n" data-sq="Takim me klientin, shikim objekti">Kundentermin, Besichtigung</span>
              </p>
            </div>
          </Link>

          <Link
            href="/neuer-auftrag/baustelle"
            className="nsh-card-tap flex min-h-36 flex-col justify-between rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 hover:bg-amber-100 sm:min-h-44"
          >
            <Building2 className="size-12 text-amber-700" />
            <div>
              <p className="text-2xl font-black text-amber-900">
                <span className="nsh-i18n" data-sq="Planifiko kantierin">Baustelle planen</span>
              </p>
              <p className="mt-1 text-base text-amber-700">
                <span className="nsh-i18n" data-sq="Porosi, projekt, rinovim">Auftrag, Projekt, Renovierung</span>
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

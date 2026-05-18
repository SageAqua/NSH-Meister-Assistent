import { createHmac } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarCopyButton } from "@/components/calendar-copy-button"
import { CalendarDays, LogOut, MapPin, Phone, Settings, User } from "lucide-react"

export default async function EinstellungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const calToken = user && process.env.CALENDAR_SECRET
    ? createHmac("sha256", process.env.CALENDAR_SECRET).update(user.id).digest("hex")
    : null
  const calUrl = calToken
    ? `https://nshrenovierung.vercel.app/api/calendar/feed.ics?token=${calToken}`
    : null

  return (
    <div className="nsh-page max-w-5xl">
      <div className="nsh-page-header flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
          <Settings className="size-5 text-primary-foreground" />
        </div>
        <div>
          <p className="nsh-eyebrow">
            <span className="nsh-i18n" data-sq="Llogaria">Konto</span>
          </p>
          <h1 className="nsh-title">
            <span className="nsh-i18n" data-sq="Cilësime">Einstellungen</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Profil */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <span className="nsh-i18n" data-sq="Profili">Profil</span>
          </h2>
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-2xl font-black text-primary-foreground">N</div>
                <div>
                  <p className="text-lg font-bold">Naim Shala</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="nsh-i18n" data-sq="Rinovim · Vechta">NSH Renovierung · Vechta</span>
                  </p>
                </div>
              </div>
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" /> {user.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4" />
                <span className="nsh-i18n" data-sq="Vendos telefonin te porositë">Telefon in Aufträgen eingeben</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                <span className="nsh-i18n" data-sq="Vechta, Saksonia e Poshtme">Vechta, Niedersachsen</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* App info */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <span className="nsh-i18n" data-sq="App">App</span>
          </h2>
          <Card>
            <CardContent className="space-y-1 p-4">
              {[
                { label: "Version", labelSq: "Versioni", value: "1.0.0", valueSq: "1.0.0" },
                { label: "Sprache", labelSq: "Gjuha", value: "Deutsch", valueSq: "Gjermanisht" },
                { label: "Datenbank", labelSq: "Baza e të dhënave", value: user ? "✓ Verbunden" : "Getrennt", valueSq: user ? "✓ Lidhur" : "E shkëputur" },
              ].map(({ label, labelSq, value, valueSq }) => (
                <div key={label} className="flex items-center justify-between border-b py-2 last:border-0">
                  <span className="text-sm text-muted-foreground">
                    <span className="nsh-i18n" data-sq={labelSq}>{label}</span>
                  </span>
                  <span className="text-sm font-semibold">
                    <span className="nsh-i18n" data-sq={valueSq}>{value}</span>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Apple Kalender */}
      {calUrl && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <CalendarDays className="size-4" />
            <span className="nsh-i18n" data-sq="Kalendari Apple">Apple Kalender</span>
          </h2>
          <Card>
            <CardContent className="space-y-4 p-4">
              <p className="text-sm text-muted-foreground">
                <span className="nsh-i18n" data-sq="Abonohu në këtë link në app-in e kalendarit. Terminet e reja shfaqen automatikisht — pa punë tjetër.">
                  Abonniere diesen Link in deiner Kalender-App. Neue Termine erscheinen automatisch — kein weiterer Aufwand.
                </span>
              </p>
              <input
                readOnly
                value={calUrl}
                className="w-full rounded-lg border bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground"
              />
              <CalendarCopyButton url={calUrl} />
              <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">
                  <span className="nsh-i18n" data-sq="Konfigurimi në iPhone:">Einrichtung auf iPhone:</span>
                </p>
                <p><span className="nsh-i18n" data-sq="1. Cilësime → Kalendar → Llogari → Shto llogari">1. Einstellungen → Kalender → Konten → Konto hinzufügen</span></p>
                <p><span className="nsh-i18n" data-sq="2. Tjetër → Shto abonim kalendari">2. Andere → Kalenderabo hinzufügen</span></p>
                <p><span className="nsh-i18n" data-sq="3. Vendos linkun sipër → Vazhdo → Ruaj">3. Link oben einfügen → Weiter → Sichern</span></p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <form action={logoutAction} className="max-w-md">
        <Button type="submit" variant="destructive" size="touch" className="w-full gap-2">
          <LogOut className="size-5" />
          <span className="nsh-i18n nsh-i18n-button" data-sq="Dil">Abmelden</span>
        </Button>
      </form>
    </div>
  )
}

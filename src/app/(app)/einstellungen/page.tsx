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
          <p className="nsh-eyebrow">Konto</p>
          <h1 className="nsh-title">Einstellungen</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Profil */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Profil</h2>
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-2xl font-black text-primary-foreground">N</div>
                <div>
                  <p className="text-lg font-bold">Naim Shala</p>
                  <p className="text-sm text-muted-foreground">NSH Renovierung · Vechta</p>
                </div>
              </div>
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" /> {user.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4" /> Telefon in Aufträgen eingeben
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" /> Vechta, Niedersachsen
              </div>
            </CardContent>
          </Card>
        </section>

        {/* App info */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">App</h2>
          <Card>
            <CardContent className="space-y-1 p-4">
              {[
                { label: "Version", value: "1.0.0" },
                { label: "Sprache", value: "Deutsch" },
                { label: "Datenbank", value: user ? "✓ Verbunden" : "Getrennt" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border-b py-2 last:border-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold">{value}</span>
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
            <CalendarDays className="size-4" /> Apple Kalender
          </h2>
          <Card>
            <CardContent className="space-y-4 p-4">
              <p className="text-sm text-muted-foreground">
                Abonniere diesen Link in deiner Kalender-App. Neue Termine erscheinen automatisch — kein weiterer Aufwand.
              </p>
              <input
                readOnly
                value={calUrl}
                className="w-full rounded-lg border bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground"
              />
              <CalendarCopyButton url={calUrl} />
              <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">Einrichtung auf iPhone:</p>
                <p>1. Einstellungen → Kalender → Konten → Konto hinzufügen</p>
                <p>2. Andere → Kalenderabo hinzufügen</p>
                <p>3. Link oben einfügen → Weiter → Sichern</p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <form action={logoutAction} className="max-w-md">
        <Button type="submit" variant="destructive" size="touch" className="w-full gap-2">
          <LogOut className="size-5" /> Abmelden
        </Button>
      </form>
    </div>
  )
}

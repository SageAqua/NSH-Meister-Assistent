import { createClient } from "@/lib/supabase/server"
import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, LogOut, User, Phone, MapPin, Info } from "lucide-react"

export default async function EinstellungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="nsh-page max-w-5xl">
      <div className="nsh-page-header flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
          <Settings className="size-5 text-primary-foreground" />
        </div>
        <div>
          <p className="nsh-eyebrow">Konto</p>
          <h1 className="nsh-title">Einstellungen</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Profil</h2>
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-lg bg-primary text-2xl font-black text-primary-foreground">N</div>
                <div>
                  <p className="text-lg font-bold">Naim Shala</p>
                  <p className="text-sm text-muted-foreground">NSH Renovierung - Vechta</p>
                </div>
              </div>
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" />
                  {user.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4" />
                Telefon in Auftraegen eingeben
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                Vechta, Niedersachsen
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">App</h2>
          <Card>
            <CardContent className="space-y-3 p-4">
              {[
                { label: "Version", value: "1.0.0" },
                { label: "Sprache / Gjuha", value: "Deutsch (DE)" },
                { label: "Datenbankstatus", value: user ? "Verbunden" : "Nicht verbunden" },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 border-b py-1 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold sm:text-right">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Supabase einrichten</p>
              <p className="mt-1 text-xs text-amber-700">
                Fuege <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
                <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
                in <code className="rounded bg-amber-100 px-1">.env.local</code> ein.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form action={logoutAction} className="max-w-md">
        <Button type="submit" variant="destructive" size="touch" className="w-full gap-2">
          <LogOut className="size-5" /> Abmelden
        </Button>
      </form>
    </div>
  )
}

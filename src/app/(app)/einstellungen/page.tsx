import { createClient } from "@/lib/supabase/server"
import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, LogOut, User, Phone, MapPin, Info } from "lucide-react"

export default async function EinstellungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="w-full max-w-lg space-y-5 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
          <Settings className="size-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold sm:text-2xl">Einstellungen <span className="text-muted-foreground font-normal text-base sm:text-lg">/ Cilësimet</span></h1>
      </div>

      {/* Profile */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Profil</h2>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-black">N</div>
              <div>
                <p className="text-lg font-bold">Naim Shala</p>
                <p className="text-sm text-muted-foreground">NSH Renovierung · Vechta</p>
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
              Telefon in Aufträgen eingeben
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              Vechta, Niedersachsen
            </div>
          </CardContent>
        </Card>
      </section>

      {/* App Info */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">App</h2>
        <Card>
          <CardContent className="p-4 space-y-3">
            {[
              { label: "Version", value: "1.0.0" },
              { label: "Sprache / Gjuha", value: "Deutsch (DE)" },
              { label: "Datenbankstatus", value: user ? "Verbunden ✓" : "Nicht verbunden" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5 py-1 border-b last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold sm:text-right">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Supabase setup hint */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Supabase einrichten</p>
              <p className="text-xs text-amber-700 mt-1">
                Füge <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
                <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
                in deine <code className="bg-amber-100 px-1 rounded">.env.local</code> ein.
                Die SQL-Migrations findest du in <code className="bg-amber-100 px-1 rounded">supabase/migrations/</code>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <form action={logoutAction}>
        <Button type="submit" variant="destructive" size="touch" className="w-full gap-2">
          <LogOut className="size-5" /> Abmelden / Dilni
        </Button>
      </form>
    </div>
  )
}

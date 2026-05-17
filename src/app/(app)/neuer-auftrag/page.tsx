import { createClient } from "@/lib/supabase/server"
import { UniversalWizard } from "./universal-wizard"
import type { Customer } from "@/types"

export default async function NeuerAuftragPage() {
  const supabase = await createClient()
  const { data: customers } = await supabase.from("customers").select("*").order("name")

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-4 rounded-lg border bg-card p-4 shadow-sm sm:mb-5 sm:p-5">
        <p className="text-sm font-black uppercase tracking-wide text-primary">Neuer Auftrag</p>
        <h1 className="mt-1 text-3xl font-black leading-tight">Schnell aufschreiben, fertig.</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Keine Pflicht-Auswahl. Jede Arbeit kann frei beschrieben und spaeter ergaenzt werden.
        </p>
      </div>
      <UniversalWizard customers={(customers ?? []) as Customer[]} />
    </div>
  )
}

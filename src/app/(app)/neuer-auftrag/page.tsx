import { createClient } from "@/lib/supabase/server"
import { UniversalWizard } from "./universal-wizard"
import type { Customer } from "@/types"

export default async function NeuerAuftragPage() {
  const supabase = await createClient()
  const { data: customers } = await supabase.from("customers").select("*").order("name")

  return (
    <div className="nsh-page max-w-5xl">
      <div className="nsh-page-header">
        <p className="nsh-eyebrow">Neuer Auftrag</p>
        <h1 className="nsh-title">Schnell aufschreiben, fertig.</h1>
        <p className="nsh-subtitle">
          Keine Pflicht-Auswahl. Jede Arbeit kann frei beschrieben und spaeter ergaenzt werden.
        </p>
      </div>
      <UniversalWizard customers={(customers ?? []) as Customer[]} />
    </div>
  )
}

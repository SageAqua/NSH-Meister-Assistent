import { createClient } from "@/lib/supabase/server"
import { UniversalWizard } from "./universal-wizard"
import type { Customer } from "@/types"

export default async function NeuerAuftragPage() {
  const supabase = await createClient()
  const { data: customers } = await supabase.from("customers").select("*").order("name")

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Neuer Auftrag</h1>
        <p className="text-muted-foreground">Porosi e Re — Schritt für Schritt</p>
      </div>
      <UniversalWizard customers={(customers ?? []) as Customer[]} />
    </div>
  )
}

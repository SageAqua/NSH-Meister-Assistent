import { createClient } from "@/lib/supabase/server"
import { UniversalWizard } from "../universal-wizard"
import type { Customer } from "@/types"

export default async function BaustelleTerminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true })

  const customers = (data ?? []) as Customer[]

  return <UniversalWizard customers={customers} />
}

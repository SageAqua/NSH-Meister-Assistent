import { createClient } from "@/lib/supabase/server"
import { KundenClient } from "./kunden-client"
import type { Customer } from "@/types"

export default async function KundenPage() {
  const supabase = await createClient()
  const { data: customers } = await supabase
    .from("customers")
    .select("*, projects(id, status)")
    .order("name")

  return (
    <KundenClient
      customers={(customers ?? []) as (Customer & { projects: { id: string; status: string }[] })[]}
    />
  )
}

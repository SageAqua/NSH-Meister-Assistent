import { createClient } from "@/lib/supabase/server"
import { BaustellenClient } from "./baustellen-client"
import type { Customer, Project } from "@/types"

export default async function BaustellenPage() {
  const supabase = await createClient()
  const [{ data: projects }, { data: customers }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, customers(*)")
      .order("created_at", { ascending: false }),
    supabase.from("customers").select("*").order("name"),
  ])

  return (
    <BaustellenClient
      projects={(projects ?? []) as (Project & { customers?: Customer | null })[]}
      customers={(customers ?? []) as Customer[]}
    />
  )
}

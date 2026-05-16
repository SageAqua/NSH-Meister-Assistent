import { createClient } from "@/lib/supabase/server"
import { NotizenClient } from "./notizen-client"
import type { Note } from "@/types"

export type ProjectOption = {
  id: string
  service_type: string
  address: string | null
  customers: { name: string } | null
}

export type CustomerOption = {
  id: string
  name: string
}

export default async function NotizenPage() {
  const supabase = await createClient()
  const [{ data: notes }, { data: projects }, { data: customers }] = await Promise.all([
    supabase.from("notes").select("*, projects(id, service_type, address, customers(name)), customers(name, phone)").order("created_at", { ascending: false }),
    supabase.from("projects").select("id, service_type, address, customers(name)").eq("status", "in_arbeit").order("created_at"),
    supabase.from("customers").select("id, name").order("name"),
  ])

  return (
    <NotizenClient
      notes={(notes ?? []) as Note[]}
      projects={(projects ?? []) as unknown as ProjectOption[]}
      customers={(customers ?? []) as CustomerOption[]}
    />
  )
}

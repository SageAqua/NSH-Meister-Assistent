import { createClient } from "@/lib/supabase/server"
import { ArbeitTerminForm } from "./arbeit-form"
import type { Customer } from "@/types"

export default async function ArbeitTerminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true })

  const customers = (data ?? []) as Customer[]

  return <ArbeitTerminForm customers={customers} />
}

import { createClient } from "@/lib/supabase/server"
import { FinanzenClient } from "./finanzen-client"
import type { DocumentRecord } from "@/types"

export default async function FinanzenPage() {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear()

  const { data } = await supabase
    .from("documents")
    .select("*")
    .gte("created_at", `${currentYear}-01-01`)
    .lte("created_at", `${currentYear}-12-31T23:59:59`)
    .not("amount_gross", "is", null)
    .order("document_date", { ascending: false, nullsFirst: false })

  const documents = (data ?? []) as DocumentRecord[]

  return <FinanzenClient documents={documents} currentYear={currentYear} />
}

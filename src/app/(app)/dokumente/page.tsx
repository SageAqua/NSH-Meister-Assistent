import { createClient } from "@/lib/supabase/server"
import { DokumenteClient } from "./dokumente-client"
import type { DocumentRecord } from "@/types"

export default async function DokumentePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })

  const documents = (data ?? []) as DocumentRecord[]

  return <DokumenteClient documents={documents} />
}

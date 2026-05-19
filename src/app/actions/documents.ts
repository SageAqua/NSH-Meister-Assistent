"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { DocumentAnalysis, DocType, DocDirection, DocCategory } from "@/types"

export interface SaveDocumentPayload {
  filePath: string
  originalFilename: string
  suggestedFilename: string
  fileSize: number
  analysis: DocumentAnalysis
  analysisRaw: string
}

export async function saveDocument(payload: SaveDocumentPayload): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      file_path: payload.filePath,
      original_filename: payload.originalFilename,
      suggested_filename: payload.suggestedFilename,
      file_size: payload.fileSize,
      doc_type: payload.analysis.doc_type,
      doc_direction: payload.analysis.doc_direction,
      category: payload.analysis.category,
      vendor: payload.analysis.vendor,
      recipient: payload.analysis.recipient,
      amount_gross: payload.analysis.amount_gross,
      amount_net: payload.analysis.amount_net,
      amount_vat: payload.analysis.amount_vat,
      vat_rate: payload.analysis.vat_rate,
      document_date: payload.analysis.document_date,
      document_number: payload.analysis.document_number,
      status: "analyzed",
      analysis_raw: payload.analysisRaw,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/dokumente")
  revalidatePath("/finanzen")
  revalidatePath("/heute")

  return { id: data.id }
}

export async function deleteDocument(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (doc?.file_path) {
    await supabase.storage.from("documents").remove([doc.file_path])
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dokumente")
  revalidatePath("/finanzen")
  revalidatePath("/heute")

  return {}
}

export async function updateDocumentMeta(
  id: string,
  updates: { doc_type?: DocType; doc_direction?: DocDirection; category?: DocCategory; vendor?: string }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  const { error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dokumente")
  revalidatePath("/finanzen")

  return {}
}

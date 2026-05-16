import { createClient } from "@/lib/supabase/server"
import { DeutschLernenClient } from "./deutsch-lernen-client"
import type { DictionaryTerm } from "@/types"

const FALLBACK_TERMS: DictionaryTerm[] = [
  { id: "1", section: "baustelle", german: "die Baustelle", albanian: "kantieri", example_de: "Die Baustelle ist bereit.", example_al: "Kantieri është gati." },
  { id: "2", section: "baustelle", german: "der Untergrund", albanian: "baza", example_de: "Der Untergrund ist schlecht.", example_al: "Baza është e keqe." },
  { id: "3", section: "baustelle", german: "das Vinyl", albanian: "vinili", example_de: "Das Vinyl wird verlegt.", example_al: "Vinili vendoset." },
  { id: "4", section: "kunden", german: "Guten Tag, ich bin Naim Shala.", albanian: "Mirëdita, unë jam Naim Shala.", example_de: null, example_al: null },
  { id: "5", section: "kunden", german: "Ich muss zuerst den Untergrund prüfen.", albanian: "Duhet së pari ta kontrolloj bazën.", example_de: null, example_al: null },
  { id: "6", section: "kunden", german: "Wann würde Ihnen eine Besichtigung passen?", albanian: "Kur ju përshtatet një vizitë?", example_de: null, example_al: null },
  { id: "7", section: "preise", german: "Der genaue Preis kann erst nach Besichtigung bestätigt werden.", albanian: "Çmimi i saktë mund të konfirmohet vetëm pas shikimit të objektit.", example_de: null, example_al: null },
  { id: "8", section: "preise", german: "Ich mache Ihnen ein schriftliches Angebot.", albanian: "Ju bëj një ofertë me shkrim.", example_de: null, example_al: null },
  { id: "9", section: "termine", german: "Ich bin pünktlich da.", albanian: "Jam atje me kohë.", example_de: null, example_al: null },
  { id: "10", section: "termine", german: "Ich komme um 8 Uhr.", albanian: "Vij në ora 8.", example_de: null, example_al: null },
]

export default async function DeutschLernenPage() {
  const supabase = await createClient()
  const { data: terms, error } = await supabase
    .from("dictionary_terms")
    .select("*")
    .order("section")

  const allTerms = (error || !terms || terms.length === 0)
    ? FALLBACK_TERMS
    : (terms as DictionaryTerm[])

  return <DeutschLernenClient terms={allTerms} />
}

import { addDaysToDateKey } from "@/lib/datetime"

export type WorkCategory = "maler" | "boden" | "fugen" | "leisten" | "trockenbau" | "sonstiges"

export interface ServiceItem {
  id: string
  category: WorkCategory
  labelDe: string
  labelSq: string
  rateNormal: number
  rateLow: number
  rateHigh: number
  unit: "m2" | "lfm" | "stk" | "pauschal"
  daysPerUnit: number // Arbeitstage pro 20 Einheiten
}

export interface PriceResult {
  low: number
  normal: number
  high: number
}

export const SERVICES: ServiceItem[] = [
  // Malerarbeiten
  { id: "waende", category: "maler", labelDe: "Wände streichen", labelSq: "Lyerja e mureve", rateNormal: 10, rateLow: 8, rateHigh: 13, unit: "m2", daysPerUnit: 1 },
  { id: "decke", category: "maler", labelDe: "Decke streichen", labelSq: "Lyerja e tavanit", rateNormal: 14, rateLow: 11, rateHigh: 17, unit: "m2", daysPerUnit: 1.5 },
  { id: "tapezieren", category: "maler", labelDe: "Tapezieren", labelSq: "Tapetim", rateNormal: 24, rateLow: 18, rateHigh: 30, unit: "m2", daysPerUnit: 1.5 },
  { id: "fassade", category: "maler", labelDe: "Außenfassade", labelSq: "Fasada e jashtme", rateNormal: 16, rateLow: 12, rateHigh: 20, unit: "m2", daysPerUnit: 1.5 },
  { id: "grundierung", category: "maler", labelDe: "Grundierung (1x)", labelSq: "Grundim (1x)", rateNormal: 7, rateLow: 5, rateHigh: 9, unit: "m2", daysPerUnit: 0.5 },
  { id: "tapete-entfernen", category: "maler", labelDe: "Tapete entfernen", labelSq: "Heqje tapeti", rateNormal: 8, rateLow: 6, rateHigh: 12, unit: "m2", daysPerUnit: 0.7 },
  { id: "risse-ausbessern", category: "maler", labelDe: "Risse ausbessern", labelSq: "Riparim plasaritjesh", rateNormal: 9, rateLow: 6, rateHigh: 14, unit: "m2", daysPerUnit: 0.8 },
  // Bodenarbeiten
  { id: "klickvinyl", category: "boden", labelDe: "Klickvinyl", labelSq: "Vinyl klik", rateNormal: 28, rateLow: 24, rateHigh: 34, unit: "m2", daysPerUnit: 1 },
  { id: "klebevinyl", category: "boden", labelDe: "Klebevinyl", labelSq: "Vinyl ngjites", rateNormal: 35, rateLow: 30, rateHigh: 43, unit: "m2", daysPerUnit: 1.2 },
  { id: "rigid", category: "boden", labelDe: "Rigid Vinyl", labelSq: "Vinyl rigid", rateNormal: 32, rateLow: 27, rateHigh: 39, unit: "m2", daysPerUnit: 1 },
  { id: "laminat", category: "boden", labelDe: "Laminat", labelSq: "Laminat", rateNormal: 20, rateLow: 17, rateHigh: 25, unit: "m2", daysPerUnit: 0.8 },
  { id: "boden-entfernen", category: "boden", labelDe: "Alten Boden entfernen", labelSq: "Heqje dyshemeje të vjetër", rateNormal: 9, rateLow: 6, rateHigh: 14, unit: "m2", daysPerUnit: 0.8 },
  { id: "untergrund-schleifen", category: "boden", labelDe: "Untergrund schleifen", labelSq: "Lëmim i bazës", rateNormal: 8, rateLow: 6, rateHigh: 12, unit: "m2", daysPerUnit: 0.6 },
  { id: "ausgleichsmasse", category: "boden", labelDe: "Ausgleichsmasse", labelSq: "Masë niveluese", rateNormal: 16, rateLow: 12, rateHigh: 22, unit: "m2", daysPerUnit: 1 },
  // Fugen & Spachtel
  { id: "fugenverspachteln-q1", category: "fugen", labelDe: "Fugenverspachteln Q1", labelSq: "Mbushje fugash Q1", rateNormal: 7, rateLow: 5, rateHigh: 10, unit: "m2", daysPerUnit: 0.7 },
  { id: "fugenverspachteln-q2", category: "fugen", labelDe: "Fugenverspachteln Q2", labelSq: "Mbushje fugash Q2", rateNormal: 10, rateLow: 8, rateHigh: 14, unit: "m2", daysPerUnit: 0.9 },
  { id: "spachtel-q3", category: "fugen", labelDe: "Spachteln Q3", labelSq: "Patinim Q3", rateNormal: 18, rateLow: 14, rateHigh: 24, unit: "m2", daysPerUnit: 1.2 },
  { id: "silikonfugen", category: "fugen", labelDe: "Silikonfugen erneuern", labelSq: "Rinovim fugash silikoni", rateNormal: 14, rateLow: 10, rateHigh: 20, unit: "lfm", daysPerUnit: 0.7 },
  { id: "acrylfugen", category: "fugen", labelDe: "Acrylfugen ziehen", labelSq: "Vendosje fugash akrili", rateNormal: 8, rateLow: 6, rateHigh: 12, unit: "lfm", daysPerUnit: 0.5 },
  { id: "fliesenfugen-erneuern", category: "fugen", labelDe: "Fliesenfugen erneuern", labelSq: "Rinovim fugash pllakash", rateNormal: 24, rateLow: 18, rateHigh: 34, unit: "m2", daysPerUnit: 1.4 },
  // Leisten & Montage
  { id: "fussleisten-montieren", category: "leisten", labelDe: "Fußleisten montieren", labelSq: "Montim listelash dyshemeje", rateNormal: 9, rateLow: 6, rateHigh: 14, unit: "lfm", daysPerUnit: 0.5 },
  { id: "fussleisten-demontieren", category: "leisten", labelDe: "Fußleisten demontieren", labelSq: "Çmontim listelash dyshemeje", rateNormal: 4, rateLow: 3, rateHigh: 7, unit: "lfm", daysPerUnit: 0.3 },
  { id: "sockelleisten-versiegeln", category: "leisten", labelDe: "Sockelleisten versiegeln", labelSq: "Mbyllje listelash me silikon/akril", rateNormal: 5, rateLow: 3, rateHigh: 8, unit: "lfm", daysPerUnit: 0.3 },
  { id: "uebergangsschienen", category: "leisten", labelDe: "Übergangsschienen setzen", labelSq: "Montim shina kalimi", rateNormal: 22, rateLow: 15, rateHigh: 35, unit: "stk", daysPerUnit: 0.4 },
  { id: "tuerenmontage", category: "leisten", labelDe: "Türenmontage", labelSq: "Montim dyersh", rateNormal: 180, rateLow: 120, rateHigh: 280, unit: "stk", daysPerUnit: 0.8 },
  { id: "tueren-kuerzen", category: "leisten", labelDe: "Türen kürzen", labelSq: "Shkurtim dyersh", rateNormal: 80, rateLow: 60, rateHigh: 110, unit: "stk", daysPerUnit: 0.4 },
  // Trockenbau
  { id: "trockenbau-wand", category: "trockenbau", labelDe: "Trockenbau Wand", labelSq: "Ndërtim i thatë mur", rateNormal: 25, rateLow: 21, rateHigh: 31, unit: "m2", daysPerUnit: 1.5 },
  { id: "trockenbau-decke", category: "trockenbau", labelDe: "Trockenbau Decke", labelSq: "Ndërtim i thatë tavan", rateNormal: 30, rateLow: 25, rateHigh: 37, unit: "m2", daysPerUnit: 2 },
  { id: "daemmung-einlegen", category: "trockenbau", labelDe: "Dämmung einlegen", labelSq: "Vendosje izolimi", rateNormal: 9, rateLow: 6, rateHigh: 14, unit: "m2", daysPerUnit: 0.6 },
  { id: "revisionsklappe", category: "trockenbau", labelDe: "Revisionsklappe setzen", labelSq: "Montim kapaku kontrolli", rateNormal: 95, rateLow: 70, rateHigh: 140, unit: "stk", daysPerUnit: 0.5 },
  // Sonstiges
  { id: "endreinigung", category: "sonstiges", labelDe: "Endreinigung", labelSq: "Pastrimi final", rateNormal: 8, rateLow: 7, rateHigh: 10, unit: "m2", daysPerUnit: 0.5 },
  { id: "abkleben-abdecken", category: "sonstiges", labelDe: "Abkleben & Abdecken", labelSq: "Mbulim dhe ngjitje mbrojtëse", rateNormal: 4, rateLow: 3, rateHigh: 7, unit: "m2", daysPerUnit: 0.3 },
  { id: "material-holen", category: "sonstiges", labelDe: "Material holen", labelSq: "Marrje materiali", rateNormal: 65, rateLow: 45, rateHigh: 95, unit: "pauschal", daysPerUnit: 0.4 },
  { id: "entsorgung", category: "sonstiges", labelDe: "Entsorgung", labelSq: "Hedhje mbeturinash", rateNormal: 12, rateLow: 8, rateHigh: 20, unit: "m2", daysPerUnit: 0.5 },
]

export const CATEGORY_META: Record<WorkCategory, { labelDe: string; labelSq: string; emoji: string }> = {
  maler: { labelDe: "Malerarbeiten", labelSq: "Punime lyerjeje", emoji: "🖌️" },
  boden: { labelDe: "Bodenarbeiten", labelSq: "Punime dyshemeje", emoji: "🪵" },
  fugen: { labelDe: "Fugen & Spachtel", labelSq: "Fuga & patinim", emoji: "▦" },
  leisten: { labelDe: "Leisten & Montage", labelSq: "Listela & montim", emoji: "📏" },
  trockenbau: { labelDe: "Trockenbau", labelSq: "Ndërtim i thatë", emoji: "🧱" },
  sonstiges: { labelDe: "Sonstiges", labelSq: "Të tjera", emoji: "🔧" },
}

export const UNIT_LABELS: Record<ServiceItem["unit"], string> = {
  m2: "m²",
  lfm: "lfm",
  stk: "Stk",
  pauschal: "pauschal",
}

export const UNIT_LABELS_SQ: Record<ServiceItem["unit"], string> = {
  m2: "m²",
  lfm: "metër linear",
  stk: "copë",
  pauschal: "paushal",
}

export function calcPrice(service: ServiceItem, area: number, aufwaendig: boolean): PriceResult {
  const factor = aufwaendig ? 1.25 : 1.0
  return {
    low: Math.round(service.rateLow * area * factor),
    normal: Math.round(service.rateNormal * area * factor),
    high: Math.round(service.rateHigh * area * factor),
  }
}

export function calcDuration(service: ServiceItem, area: number): number {
  return Math.max(1, Math.round((area / 20) * service.daysPerUnit))
}

export interface WorkerConfig {
  id: string
  label: string
  labelSq: string
  emoji: string
  totalWorkers: number
  helpersCount: number
}

export const WORKER_CONFIGS: WorkerConfig[] = [
  { id: "allein", label: "Ich alleine", labelSq: "Vetem une", emoji: "👷", totalWorkers: 1, helpersCount: 0 },
  { id: "helfer1", label: "Ich + 1 Helfer", labelSq: "Une + 1 ndihmes", emoji: "👷👷", totalWorkers: 2, helpersCount: 1 },
  { id: "nur_helfer", label: "Nur 1 Helfer", labelSq: "Vetem 1 ndihmes", emoji: "👤", totalWorkers: 1, helpersCount: 1 },
  { id: "helfer2", label: "Ich + 2 Helfer", labelSq: "Une + 2 ndihmes", emoji: "👷👷👷", totalWorkers: 3, helpersCount: 2 },
]

export interface WorkDayPlan {
  day: number
  date: string
  title: string
  tasksDe: string[]
  tasksSq: string[]
  startTime: string
  endTime: string
}

function addDays(dateStr: string, n: number): string {
  return addDaysToDateKey(dateStr, n)
}

function workerFactor(total: number): number {
  if (total <= 1) return 1.0
  if (total === 2) return 1.75
  return 2.4
}

export function calcDaysWithWorkers(service: ServiceItem, area: number, totalWorkers: number): number {
  return Math.max(1, Math.ceil(calcDuration(service, area) / workerFactor(totalWorkers)))
}

export function generateWorkPlan(
  service: ServiceItem,
  area: number,
  totalWorkers: number,
  startDate: string
): WorkDayPlan[] {
  const totalDays = calcDaysWithWorkers(service, area, totalWorkers)
  const unit = UNIT_LABELS[service.unit]
  const plans: WorkDayPlan[] = []

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i)
    let title: string
    let tasksDe: string[]
    let tasksSq: string[]

    if (totalDays === 1) {
      title = service.labelDe
      tasksDe = ["Vorbereitung & Material", `${service.labelDe} (${area} ${unit})`, "Aufräumen & Abnahme mit Kunde"]
      tasksSq = ["Përgatitja & materiali", `${service.labelSq} (${area} ${unit})`, "Pastrim & dorëzim me klientin"]
    } else if (i === 0) {
      title = `${service.labelDe} — Tag 1 (Vorbereitung)`
      tasksDe = ["Untergrund prüfen & vorbereiten", "Material ausladen & aufbauen", `Beginn: ${service.labelDe}`]
      tasksSq = ["Kontrollo & pergatit bazen", "Shkarko & organizo materialin", `Fillim: ${service.labelSq}`]
    } else if (i === totalDays - 1) {
      title = `${service.labelDe} — Tag ${i + 1} (Abschluss)`
      tasksDe = [`${service.labelDe} fertigstellen`, "Endreinigung", "Abnahme mit Kunde"]
      tasksSq = [`Perfundo ${service.labelSq}`, "Pastrim final", "Dorezim me klientin"]
    } else {
      title = `${service.labelDe} — Tag ${i + 1}`
      tasksDe = [`${service.labelDe} fortsetzen (Teil ${i} von ${totalDays})`]
      tasksSq = [`Vazhdo ${service.labelSq} (pjesa ${i} nga ${totalDays})`]
    }

    plans.push({ day: i + 1, date, title, tasksDe, tasksSq, startTime: "07:00", endTime: "16:00" })
  }
  return plans
}

export function buildWhatsAppText(service: ServiceItem, area: number, result: PriceResult): string {
  const days = calcDuration(service, area)
  const unit = UNIT_LABELS[service.unit]
  return encodeURIComponent(
    `Guten Tag,\n\nfür Ihre Anfrage (${service.labelDe}, ca. ${area} ${unit}):\n• Preis: ca. ${result.low.toLocaleString("de-DE")} € – ${result.high.toLocaleString("de-DE")} €\n• Dauer: ca. ${days} Tag${days !== 1 ? "e" : ""}\n\nDer genaue Preis kann erst nach Besichtigung bestätigt werden.\n\nNSH Renovierung – Naim Shala`
  )
}

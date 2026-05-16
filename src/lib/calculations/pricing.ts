export type WorkCategory = "maler" | "boden" | "sonstiges"

export interface ServiceItem {
  id: string
  category: WorkCategory
  labelDe: string
  labelSq: string
  rateNormal: number
  rateLow: number
  rateHigh: number
  unit: "m2" | "pauschal"
  daysPerUnit: number // Arbeitstage pro 20 m²
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
  // Bodenarbeiten
  { id: "klickvinyl", category: "boden", labelDe: "Klickvinyl", labelSq: "Vinyl klik", rateNormal: 28, rateLow: 24, rateHigh: 34, unit: "m2", daysPerUnit: 1 },
  { id: "klebevinyl", category: "boden", labelDe: "Klebevinyl", labelSq: "Vinyl ngjites", rateNormal: 35, rateLow: 30, rateHigh: 43, unit: "m2", daysPerUnit: 1.2 },
  { id: "rigid", category: "boden", labelDe: "Rigid Vinyl", labelSq: "Vinyl rigid", rateNormal: 32, rateLow: 27, rateHigh: 39, unit: "m2", daysPerUnit: 1 },
  { id: "laminat", category: "boden", labelDe: "Laminat", labelSq: "Laminat", rateNormal: 20, rateLow: 17, rateHigh: 25, unit: "m2", daysPerUnit: 0.8 },
  // Sonstiges
  { id: "spachtel", category: "sonstiges", labelDe: "Spachtelarbeiten", labelSq: "Shpetim me suva", rateNormal: 12, rateLow: 10, rateHigh: 15, unit: "m2", daysPerUnit: 1 },
  { id: "trockenbau-wand", category: "sonstiges", labelDe: "Trockenbau Wand", labelSq: "Ndertim i thate mur", rateNormal: 25, rateLow: 21, rateHigh: 31, unit: "m2", daysPerUnit: 1.5 },
  { id: "trockenbau-decke", category: "sonstiges", labelDe: "Trockenbau Decke", labelSq: "Ndertim i thate tavan", rateNormal: 30, rateLow: 25, rateHigh: 37, unit: "m2", daysPerUnit: 2 },
  { id: "endreinigung", category: "sonstiges", labelDe: "Endreinigung", labelSq: "Pastrimi final", rateNormal: 8, rateLow: 7, rateHigh: 10, unit: "m2", daysPerUnit: 0.5 },
]

export const CATEGORY_META: Record<WorkCategory, { labelDe: string; labelSq: string; emoji: string }> = {
  maler: { labelDe: "Malerarbeiten", labelSq: "Punime lyerjeje", emoji: "🖌️" },
  boden: { labelDe: "Bodenarbeiten", labelSq: "Punime dyshemeje", emoji: "🪵" },
  sonstiges: { labelDe: "Sonstiges", labelSq: "Te tjera", emoji: "🔧" },
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
  const d = new Date(dateStr + "T12:00:00")
  d.setDate(d.getDate() + n)
  return d.toISOString().split("T")[0]
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
  const plans: WorkDayPlan[] = []

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i)
    let title: string
    let tasksDe: string[]
    let tasksSq: string[]

    if (totalDays === 1) {
      title = service.labelDe
      tasksDe = ["Vorbereitung & Material", `${service.labelDe} (${area} m²)`, "Aufräumen & Abnahme mit Kunde"]
      tasksSq = ["Pergatitja & materiali", `${service.labelSq} (${area} m²)`, "Pastrim & dorezim me klientin"]
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
  return encodeURIComponent(
    `Guten Tag,\n\nfür Ihre Anfrage (${service.labelDe}, ca. ${area} m²):\n• Preis: ca. ${result.low.toLocaleString("de-DE")} € – ${result.high.toLocaleString("de-DE")} €\n• Dauer: ca. ${days} Tag${days !== 1 ? "e" : ""}\n\nDer genaue Preis kann erst nach Besichtigung bestätigt werden.\n\nNSH Renovierung – Naim Shala`
  )
}

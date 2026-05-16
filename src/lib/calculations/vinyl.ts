import type {
  VinylOrderForm, PriceEstimate, DurationEstimate, CalendarPlanDay
} from "@/types"

const BASE_RATES: Record<string, number> = {
  klickvinyl: 28,
  klebevinyl: 35,
  rigid: 32,
  unknown: 30,
}

const DIFFICULTY_FACTORS: Record<string, number> = {
  gut: 1.0,
  mittel: 1.15,
  schlecht: 1.35,
  unbekannt: 1.1,
}

const EXTRA_COSTS = {
  sockelleisten: (m2: number) => m2 * 2,
  bodenEntfernen: (m2: number) => m2 * 8,
  spachteln: (m2: number) => m2 * 12,
  tuerenKuerzen: (_m2: number, count: number) => count * 80,
  moebelRaeumen: (m2: number) => m2 * 1.5,
  materialHolen: () => 60,
  entsorgung: (m2: number) => m2 * 3,
  endreinigung: (m2: number) => m2 * 1.5,
}

export function calculatePrice(form: VinylOrderForm): PriceEstimate {
  const area = form.area ?? 0
  const vinylType = form.vinylType ?? "unknown"
  const difficulty = form.groundCondition ?? "unbekannt"

  const baseRate = BASE_RATES[vinylType]
  const difficultyFactor = DIFFICULTY_FACTORS[difficulty]
  const base = area * baseRate * difficultyFactor

  let extras = 0
  if (form.extras.sockelleisten) extras += EXTRA_COSTS.sockelleisten(area)
  if (form.extras.bodenEntfernen) extras += EXTRA_COSTS.bodenEntfernen(area)
  if (form.extras.spachteln) extras += EXTRA_COSTS.spachteln(area)
  if (form.extras.tuerenKuerzen) extras += EXTRA_COSTS.tuerenKuerzen(area, form.tuerenCount ?? 1)
  if (form.extras.moebelRaeumen) extras += EXTRA_COSTS.moebelRaeumen(area)
  if (form.extras.materialHolen) extras += EXTRA_COSTS.materialHolen()
  if (form.extras.entsorgung) extras += EXTRA_COSTS.entsorgung(area)
  if (form.extras.endreinigung) extras += EXTRA_COSTS.endreinigung(area)

  const normal = base + extras

  return {
    low: Math.round(normal * 0.88),
    normal: Math.round(normal),
    high: Math.round(normal * 1.15),
    breakdown: { base: Math.round(base), extras: Math.round(extras) },
  }
}

export function calculateDuration(form: VinylOrderForm): DurationEstimate {
  const area = form.area ?? 0
  const difficulty = form.groundCondition ?? "unbekannt"
  const difficultyFactor = DIFFICULTY_FACTORS[difficulty]

  const baseDays = (area / 20) * difficultyFactor

  // Add extra days for preparations
  let extraDays = 0
  if (form.extras.bodenEntfernen) extraDays += area / 40
  if (form.extras.spachteln) extraDays += area / 30

  const alleine = Math.ceil(baseDays + extraDays)
  const mitHelfer = Math.ceil(alleine * 0.65)

  return { alleine, mitHelfer }
}

export function getRiskHints(form: VinylOrderForm): string[] {
  const hints: string[] = []

  if (form.groundCondition === "schlecht") {
    hints.push("Schlechter Untergrund: Zusätzliche Spachtelarbeiten wahrscheinlich. / Bazë e keqe: Punë shtesë me suva të mundshme.")
  }
  if (form.groundCondition === "unbekannt") {
    hints.push("Untergrundqualität unbekannt: Erst nach Besichtigung kalkulierbar. / Cilësia e bazës e panjohur: Llogaritje vetëm pas vizitës.")
  }
  if (form.objectType === "altbau") {
    hints.push("Altbau: Unebenheiten und versteckte Schäden möglich. / Ndërtesë e vjetër: Mundësi pabarazish dhe dëmtimesh të fshehura.")
  }
  if (form.objectType === "renovierung") {
    hints.push("Bewohnte Renovierung: Arbeit in Etappen notwendig. / Rinovim i banuar: Puna nevojitet në faza.")
  }
  if ((form.area ?? 0) > 100) {
    hints.push("Große Fläche: Lieferung des Materials vorab klären. / Sipërfaqe e madhe: Sqaro paraprakisht dorëzimin e materialit.")
  }
  if (form.extras.tuerenKuerzen) {
    hints.push("Türen kürzen: Ziegelstaub kann Oberflächen verschmutzen. / Shkurtim dyersh: Pluhuri i tullave mund të ndotë sipërfaqet.")
  }

  return hints
}

export function generateCalendarPlan(form: VinylOrderForm): CalendarPlanDay[] {
  if (!form.startDate) return []

  const duration = calculateDuration(form)
  const days = form.extras.moebelRaeumen ? duration.alleine + 1 : duration.alleine
  const helpers = 0

  const [startHour, endHour] = getWorkingHours(form.workingHours, form.workingHoursCustom)

  const plan: CalendarPlanDay[] = []
  const startDate = new Date(form.startDate)

  for (let i = 0; i < days; i++) {
    const date = addWorkdays(startDate, i)
    const dayTasks: string[] = []

    if (i === 0) {
      // First day
      if (form.extras.moebelRaeumen && days > 1) {
        dayTasks.push("Möbel räumen und Raum vorbereiten")
        plan.push({
          date: date.toISOString().split("T")[0],
          title: "Tag 1: Vorbereitung",
          tasks: dayTasks,
          startTime: `${startHour}:00`,
          endTime: `${endHour}:00`,
          helpers,
        })
        continue
      }
      dayTasks.push("Untergrund prüfen (1h)")
      dayTasks.push("Material vorbereiten (1h)")
      if (form.extras.bodenEntfernen) dayTasks.push("Alten Boden entfernen")
      if (form.extras.spachteln) dayTasks.push("Untergrund spachteln und trocknen lassen")
      dayTasks.push("Vinyl verlegen beginnen")
      plan.push({
        date: date.toISOString().split("T")[0],
        title: `Tag ${i + 1}: Start`,
        tasks: dayTasks,
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        helpers,
      })
    } else if (i === days - 1) {
      // Last day
      dayTasks.push("Restliche Fläche verlegen")
      if (form.extras.sockelleisten) dayTasks.push("Sockelleisten anbringen")
      if (form.extras.tuerenKuerzen) dayTasks.push(`Türen kürzen (${form.tuerenCount ?? 1} Stk)`)
      dayTasks.push("Fotos machen")
      dayTasks.push("Abnahme mit Kunden")
      if (form.extras.endreinigung) dayTasks.push("Endreinigung")
      plan.push({
        date: date.toISOString().split("T")[0],
        title: `Tag ${i + 1}: Abschluss`,
        tasks: dayTasks,
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        helpers,
      })
    } else {
      plan.push({
        date: date.toISOString().split("T")[0],
        title: `Tag ${i + 1}: Verlegen`,
        tasks: ["Vinyl verlegen"],
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        helpers,
      })
    }
  }

  return plan
}

function getWorkingHours(hours?: string, custom?: string): [number, number] {
  if (hours === "09-17") return [9, 17]
  if (hours === "custom" && custom) {
    const [start, end] = custom.split("-")
    return [parseInt(start), parseInt(end)]
  }
  return [8, 16] // default
}

function addWorkdays(start: Date, days: number): Date {
  const date = new Date(start)
  let added = 0
  while (added < days) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) added++ // skip weekends
  }
  return added === 0 ? new Date(start) : date
}

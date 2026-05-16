export type NavItem = {
  href: string
  labelDe: string
  labelSq?: string
  icon?: string
}

export type ProjectStatus = "geplant" | "in_arbeit" | "fertig" | "abgesagt"
export type EventStatus = "geplant" | "erledigt" | "abgesagt"
export type NoteType = "privat" | "kunden" | "baustellen"
export type MaterialStatus = "benoetigt" | "bestellt" | "vorhanden" | "abgeholt" | "erledigt"
export type Difficulty = "leicht" | "normal" | "schwer"
export type VinylType = "klickvinyl" | "klebevinyl" | "rigid" | "unknown"
export type ObjectType = "neubau" | "altbau" | "renovierung" | "gewerbe"
export type GroundCondition = "gut" | "mittel" | "schlecht" | "unbekannt"
export type MaterialSupply = "kunde" | "nsh" | "unklar"
export type WorkingHours = "08-16" | "09-17" | "custom"

export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string | null
  address: string | null
  city: string | null
  notes: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  customer_id: string | null
  service_type: string
  status: ProjectStatus
  address: string | null
  area_m2: number | null
  vinyl_type: string | null
  object_type: string | null
  ground_condition: string | null
  extras: Record<string, boolean>
  material_supply: string | null
  helpers_count: number
  notes: string | null
  created_at: string
  customers?: Customer
}

export interface CalendarEvent {
  id: string
  user_id: string
  project_id: string | null
  title: string
  start_time: string
  end_time: string
  status: EventStatus
  helpers_count: number
  notes: string | null
  created_at: string
  projects?: Project & { customers?: Customer }
}

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  is_done: boolean
  due_date: string | null
  created_at: string
  projects?: Project
}

export interface Note {
  id: string
  user_id: string
  project_id: string | null
  customer_id: string | null
  type: NoteType
  content: string
  created_at: string
  projects?: Project
  customers?: Customer
}

export interface Material {
  id: string
  user_id: string
  project_id: string
  name: string
  status: MaterialStatus
  quantity: number | null
  unit: string
  created_at: string
  projects?: Project
}

export interface PriceCalculation {
  id: string
  user_id: string
  customer_id: string | null
  project_id: string | null
  service_type: string
  area_m2: number | null
  difficulty: string | null
  extras: Record<string, boolean>
  price_low: number | null
  price_normal: number | null
  price_high: number | null
  created_at: string
}

export interface DictionaryTerm {
  id: string
  section: string
  german: string
  albanian: string
  example_de: string | null
  example_al: string | null
}

export interface VinylOrderForm {
  customerId?: string
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  customerCity?: string
  isNewCustomer?: boolean
  objectType?: ObjectType
  vinylType?: VinylType
  area?: number
  rooms?: number
  groundCondition?: GroundCondition
  extras: {
    bodenEntfernen: boolean
    spachteln: boolean
    sockelleisten: boolean
    tuerenKuerzen: boolean
    moebelRaeumen: boolean
    materialHolen: boolean
    entsorgung: boolean
    endreinigung: boolean
  }
  material?: MaterialSupply
  startDate?: string
  workingHours?: WorkingHours
  workingHoursCustom?: string
  tuerenCount?: number
}

export interface PriceEstimate {
  low: number
  normal: number
  high: number
  breakdown: {
    base: number
    extras: number
  }
}

export interface DurationEstimate {
  alleine: number
  mitHelfer: number
}

export interface CalendarPlanDay {
  date: string
  title: string
  tasks: string[]
  startTime: string
  endTime: string
  helpers: number
}

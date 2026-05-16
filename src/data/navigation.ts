import type { NavItem } from "@/types"

export const mainNav: NavItem[] = [
  { href: "/heute", labelDe: "Heute", labelSq: "Sot", icon: "home" },
  { href: "/kalender", labelDe: "Kalender", labelSq: "Kalendari", icon: "calendar" },
  { href: "/neuer-auftrag", labelDe: "Neuer Auftrag", labelSq: "Porosi e Re", icon: "plus-circle" },
  { href: "/baustellen", labelDe: "Baustellen", labelSq: "Kantieret", icon: "building2" },
  { href: "/mehr", labelDe: "Mehr", labelSq: "Më shumë", icon: "grid" },
]

export const moreNav: NavItem[] = [
  { href: "/preisrechner", labelDe: "Preisrechner", labelSq: "Kalkulatori", icon: "calculator" },
  { href: "/notizen", labelDe: "Notizen", labelSq: "Shënime", icon: "file-text" },
  { href: "/kunden", labelDe: "Kunden", labelSq: "Klientët", icon: "users" },
  { href: "/deutsch-lernen", labelDe: "Deutsch lernen", labelSq: "Mëso Gjermanisht", icon: "book-open" },
  { href: "/material", labelDe: "Material", labelSq: "Material", icon: "package" },
  { href: "/einstellungen", labelDe: "Einstellungen", labelSq: "Cilësimet", icon: "settings" },
]

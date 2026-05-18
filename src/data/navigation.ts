import type { NavItem } from "@/types"

export const mainNav: NavItem[] = [
  { href: "/heute", labelDe: "Heute", labelSq: "Start", icon: "home" },
  { href: "/neuer-auftrag", labelDe: "Auftrag", labelSq: "Neu", icon: "plus-circle" },
  { href: "/baustellen", labelDe: "Baustellen", labelSq: "Arbeit", icon: "building2" },
  { href: "/kunden", labelDe: "Kunden", labelSq: "Telefon", icon: "users" },
  { href: "/mehr", labelDe: "Mehr", labelSq: "Alles andere", icon: "grid" },
]

export const moreNav: NavItem[] = [
  { href: "/kalender", labelDe: "Kalender", labelSq: "Termine", icon: "calendar" },
  { href: "/preisrechner", labelDe: "Preisrechner", labelSq: "Grobe Preise", icon: "calculator" },
  { href: "/notizen", labelDe: "Notizen", labelSq: "Merken", icon: "file-text" },
  { href: "/deutsch-lernen", labelDe: "Deutsch lernen", labelSq: "Sätze", icon: "book-open" },
  { href: "/material", labelDe: "Material", labelSq: "Listen", icon: "package" },
  { href: "/einstellungen", labelDe: "Einstellungen", labelSq: "Konto", icon: "settings" },
]

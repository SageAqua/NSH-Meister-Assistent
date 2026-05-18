import type { NavItem } from "@/types"

export const mainNav: NavItem[] = [
  { href: "/heute", labelDe: "Heute", labelSq: "Sot", icon: "home" },
  { href: "/neuer-auftrag", labelDe: "Auftrag", labelSq: "Porosi e re", icon: "plus-circle" },
  { href: "/baustellen", labelDe: "Baustellen", labelSq: "Kantiere", icon: "building2" },
  { href: "/kunden", labelDe: "Kunden", labelSq: "Klientë", icon: "users" },
  { href: "/mehr", labelDe: "Mehr", labelSq: "Më shumë", icon: "grid" },
]

export const moreNav: NavItem[] = [
  { href: "/kalender", labelDe: "Kalender", labelSq: "Kalendari", icon: "calendar" },
  { href: "/preisrechner", labelDe: "Preisrechner", labelSq: "Llogaritësi i çmimeve", icon: "calculator" },
  { href: "/notizen", labelDe: "Notizen", labelSq: "Shënime", icon: "file-text" },
  { href: "/deutsch-lernen", labelDe: "Deutsch lernen", labelSq: "Mëso gjermanisht", icon: "book-open" },
  { href: "/material", labelDe: "Material", labelSq: "Materiale", icon: "package" },
  { href: "/einstellungen", labelDe: "Einstellungen", labelSq: "Cilësime", icon: "settings" },
]

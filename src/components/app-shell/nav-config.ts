import { Calendar, FileText, Hammer, Home, Languages, Package, PlusSquare, Settings, Users, Calculator } from "lucide-react";

export const navItems = [
  { href: "/heute", label: "Heute", sublabel: "Sot", icon: Home },
  { href: "/kalender", label: "Kalender", sublabel: "Kalendari", icon: Calendar },
  { href: "/baustellen", label: "Baustellen", sublabel: "Punimet", icon: Hammer },
  { href: "/neuer-auftrag", label: "Neuer Auftrag", sublabel: "Porosi e re", icon: PlusSquare },
  { href: "/preisrechner", label: "Preisrechner", sublabel: "Llogaritës çmimi", icon: Calculator },
  { href: "/notizen", label: "Notizen", sublabel: "Shënime", icon: FileText },
  { href: "/kunden", label: "Kunden", sublabel: "Klientët", icon: Users },
  { href: "/deutsch-lernen", label: "Deutsch lernen", sublabel: "Mëso gjermanisht", icon: Languages },
  { href: "/material", label: "Material", sublabel: "Material", icon: Package },
  { href: "/einstellungen", label: "Einstellungen", sublabel: "Cilësimet", icon: Settings },
] as const;

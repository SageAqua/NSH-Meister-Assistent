"use client"

import type { ElementType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, Calendar, PlusCircle, Building2, Grid3x3,
  Calculator, FileText, Users, BookOpen, Package, Settings,
  HelpCircle, LogOut, FileCheck, BarChart3,
} from "lucide-react"
import { mainNav, moreNav } from "@/data/navigation"
import { cn } from "@/lib/utils"

const iconMap: Record<string, ElementType> = {
  home: Home,
  calendar: Calendar,
  "plus-circle": PlusCircle,
  building2: Building2,
  grid: Grid3x3,
  calculator: Calculator,
  "file-text": FileText,
  "file-check": FileCheck,
  "bar-chart-3": BarChart3,
  users: Users,
  "book-open": BookOpen,
  package: Package,
  settings: Settings,
}

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string
  icon: ElementType
  label: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <span className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg",
        isActive ? "bg-white/20" : "bg-sidebar-foreground/8"
      )}>
        <Icon className="size-4" />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

export function IpadSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-dvh w-56 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-sidebar-border bg-sidebar md:flex lg:w-[17rem]">

      {/* Logo */}
      <div className="px-4 pb-3 pt-5">
        <div className="flex items-center gap-3 px-1">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <img src="/logo.png" alt="NSH" className="size-9 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-black text-sidebar-foreground">NSH</p>
            <p className="truncate text-xs text-sidebar-foreground/50">Renovierung Vechta</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">

        {/* MENU section */}
        <p className="mb-1 mt-3 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-sidebar-foreground/35">
          Menu
        </p>
        {mainNav.filter(item => item.href !== "/mehr").map((item) => {
          const Icon = iconMap[item.icon ?? ""] ?? Home
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"))
          return (
            <NavItem key={item.href} href={item.href} icon={Icon} label={item.labelDe} isActive={isActive} />
          )
        })}

        <div className="my-3 border-t border-sidebar-border" />

        {/* GENERAL section */}
        <p className="mb-1 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-sidebar-foreground/35">
          Allgemein
        </p>
        {moreNav.map((item) => {
          const Icon = iconMap[item.icon ?? ""] ?? Settings
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <NavItem key={item.href} href={item.href} icon={Icon} label={item.labelDe} isActive={isActive} />
          )
        })}
        <NavItem href="/mehr" icon={Grid3x3} label="Mehr" isActive={pathname === "/mehr"} />
      </nav>

      {/* Bottom promo card */}
      <div className="px-3 pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-4 py-4">
          <div className="relative z-10">
            <p className="text-sm font-black leading-tight text-primary-foreground">NSH Dashboard</p>
            <p className="mt-0.5 text-xs text-primary-foreground/70">Assistent</p>
            <div className="mt-3 flex size-8 items-center justify-center overflow-hidden rounded-lg bg-white/20">
              <img src="/logo.png" alt="NSH" className="size-7 object-contain" />
            </div>
            <p className="mt-3 text-[10px] font-semibold text-primary-foreground/50">by Growlio</p>
          </div>
          <div className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-6 -right-2 size-24 rounded-full bg-white/5" />
        </div>
      </div>
    </aside>
  )
}

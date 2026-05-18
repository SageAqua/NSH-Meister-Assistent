"use client"

import type { ElementType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, Calendar, PlusCircle, Building2, Grid3x3,
  Calculator, FileText, Users, BookOpen, Package, Settings
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
  users: Users,
  "book-open": BookOpen,
  package: Package,
  settings: Settings,
}

export function IpadSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-dvh w-56 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-sidebar-border bg-sidebar md:flex lg:w-[19rem]">
      <div className="px-4 pb-4 pt-5">
        <div className="flex items-center gap-3 rounded-lg bg-white/7 p-3 ring-1 ring-white/10">
          <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg bg-white">
            <img src="/logo.png" alt="NSH Renovierung" className="size-12 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-black leading-tight text-sidebar-foreground">NSH Meister</p>
            <p className="truncate text-sm text-sidebar-foreground/60">Renovierung Vechta</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-4">
        <p className="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.16em] text-sidebar-foreground/38">
          Arbeit
        </p>
        {mainNav.map((item) => {
          const Icon = iconMap[item.icon ?? ""] ?? Home
          const isActive = pathname === item.href || (item.href !== "/mehr" && pathname.startsWith(item.href + "/"))
          const isNewAuftrag = item.href === "/neuer-auftrag"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex min-h-[58px] items-center gap-3 rounded-lg px-3 transition-colors",
                isNewAuftrag
                  ? "mb-2 mt-1 bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90"
                  : isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <span className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/7 text-sidebar-foreground/75 group-hover:text-sidebar-accent-foreground",
                isActive && "bg-white/10 text-sidebar-accent-foreground",
                isNewAuftrag && "bg-white/18 text-sidebar-primary-foreground"
              )}>
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className={cn("truncate text-sm font-black", isNewAuftrag && "text-sidebar-primary-foreground")}>{item.labelDe}</p>
                {item.labelSq && (
                  <p className={cn("truncate text-xs", isNewAuftrag ? "text-sidebar-primary-foreground/75" : "text-sidebar-foreground/45")}>
                    {item.labelSq}
                  </p>
                )}
              </div>
            </Link>
          )
        })}

        <div className="my-4 border-t border-sidebar-border" />
        <p className="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.16em] text-sidebar-foreground/38">
          Werkzeuge
        </p>
        {moreNav.map((item) => {
          const Icon = iconMap[item.icon ?? ""] ?? Settings
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[48px] items-center gap-3 rounded-lg px-3 transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/7">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight">{item.labelDe}</p>
                {item.labelSq && <p className="truncate text-xs text-sidebar-foreground/40">{item.labelSq}</p>}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs font-semibold text-sidebar-foreground/55">NSH Renovierung</p>
        <p className="text-xs text-sidebar-foreground/35">Meister-Assistent</p>
      </div>
    </aside>
  )
}

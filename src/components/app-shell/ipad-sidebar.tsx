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
    <aside className="hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto overscroll-contain bg-sidebar md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white">
          <img src="/logo.png" alt="NSH Renovierung" className="size-10 object-contain" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-sidebar-foreground">NSH Meister</p>
          <p className="text-xs text-sidebar-foreground/50">Naim Shala Renovierung</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 px-3 pb-4">
        {mainNav.map((item) => {
          const Icon = iconMap[item.icon ?? ""] ?? Home
          const isActive = pathname === item.href || (item.href !== "/mehr" && pathname.startsWith(item.href + "/"))
          const isNewAuftrag = item.href === "/neuer-auftrag"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[52px] items-center gap-3 rounded-xl px-4 transition-colors",
                isNewAuftrag
                  ? "mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  : isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <div>
                <p className={cn("text-sm font-semibold", isNewAuftrag && "text-primary-foreground")}>{item.labelDe}</p>
                {item.labelSq && (
                  <p className={cn("text-[10px]", isNewAuftrag ? "text-primary-foreground/70" : "text-sidebar-foreground/40")}>
                    {item.labelSq}
                  </p>
                )}
              </div>
            </Link>
          )
        })}

        {/* Divider */}
        <div className="my-3 border-t border-sidebar-border" />

        {/* More nav */}
        {moreNav.map((item) => {
          const Icon = iconMap[item.icon ?? ""] ?? Settings
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[48px] items-center gap-3 rounded-xl px-4 transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <p className="text-sm font-medium">{item.labelDe}</p>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs text-sidebar-foreground/40">NSH Renovierung · Vechta</p>
      </div>
    </aside>
  )
}

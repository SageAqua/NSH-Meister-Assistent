"use client"

import type { ElementType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, PlusCircle, Building2, Grid3x3, Users } from "lucide-react"
import { mainNav } from "@/data/navigation"
import { cn } from "@/lib/utils"

const iconMap: Record<string, ElementType> = {
  home: Home,
  calendar: Calendar,
  "plus-circle": PlusCircle,
  building2: Building2,
  users: Users,
  grid: Grid3x3,
}

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t bg-background/94 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.10)] backdrop-blur md:hidden">
      {mainNav.map((item) => {
        const Icon = iconMap[item.icon ?? ""] ?? Home
        const isActive = pathname === item.href || (item.href !== "/mehr" && pathname.startsWith(item.href + "/"))
        const isNewAuftrag = item.href === "/neuer-auftrag"

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors",
              isNewAuftrag
                ? "text-primary"
                : isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {isNewAuftrag ? (
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Icon className="size-6 text-primary-foreground" />
              </div>
            ) : (
              <span className={cn("flex size-8 items-center justify-center rounded-lg", isActive && "bg-primary/10")}>
                <Icon className="size-5" />
              </span>
            )}
            <span className={cn("text-[11px] font-black leading-none", isNewAuftrag && "sr-only")}>
              {item.labelDe}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

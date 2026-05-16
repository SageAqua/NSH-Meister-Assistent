"use client"

import type { ElementType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, PlusCircle, Building2, Grid3x3 } from "lucide-react"
import { mainNav } from "@/data/navigation"
import { cn } from "@/lib/utils"

const iconMap: Record<string, ElementType> = {
  home: Home,
  calendar: Calendar,
  "plus-circle": PlusCircle,
  building2: Building2,
  grid: Grid3x3,
}

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t bg-background md:hidden">
      {mainNav.map((item) => {
        const Icon = iconMap[item.icon ?? ""] ?? Home
        const isActive = pathname === item.href || (item.href !== "/mehr" && pathname.startsWith(item.href + "/"))
        const isNewAuftrag = item.href === "/neuer-auftrag"

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors",
              isNewAuftrag
                ? "text-primary"
                : isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {isNewAuftrag ? (
              <div className="flex size-10 items-center justify-center rounded-full bg-primary">
                <Icon className="size-5 text-primary-foreground" />
              </div>
            ) : (
              <Icon className="size-5" />
            )}
            <span className={cn("text-[10px] font-medium", isNewAuftrag && "sr-only")}>
              {item.labelDe}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

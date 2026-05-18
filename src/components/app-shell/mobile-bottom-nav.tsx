"use client"

import type { ElementType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, PlusCircle, Building2, Grid3x3, Users } from "lucide-react"
import { mainNav } from "@/data/navigation"
import { cn } from "@/lib/utils"
import { hapticLight } from "@/lib/haptic"

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
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border/60 bg-background/96 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_0_oklch(0_0_0/0.06),0_-8px_20px_oklch(0_0_0/0.07)] backdrop-blur-xl md:hidden">
      {mainNav.map((item) => {
        const Icon = iconMap[item.icon ?? ""] ?? Home
        const isActive = pathname === item.href || (item.href !== "/mehr" && pathname.startsWith(item.href + "/"))
        const isNewAuftrag = item.href === "/neuer-auftrag"

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={hapticLight}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5",
              "transition-colors duration-100",
              isNewAuftrag ? "text-primary" : isActive ? "text-primary" : "text-muted-foreground/70"
            )}
          >
            {isNewAuftrag ? (
              <div className="nsh-tap flex size-12 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
                <Icon className="size-6 text-primary-foreground" />
              </div>
            ) : (
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl transition-all duration-100",
                  isActive ? "bg-primary/12 scale-110" : "scale-100"
                )}
              >
                <Icon className={cn("transition-all duration-200", isActive ? "size-5.5" : "size-5")} />
              </span>
            )}
            <span
              className={cn(
                "text-[10px] font-bold leading-none tracking-tight transition-all duration-200",
                isNewAuftrag && "sr-only",
                isActive ? "opacity-100" : "opacity-60"
              )}
            >
              {item.labelDe}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

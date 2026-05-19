"use client"

import { Search, Mail, Bell } from "lucide-react"

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-40 hidden h-14 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur md:flex">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Aufgabe suchen…"
          className="h-9 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘F
        </kbd>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Mail className="size-4" />
        </button>
        <button className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="size-4" />
        </button>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 border-l border-border pl-4">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-black text-primary-foreground">
          N
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-bold leading-tight text-foreground">Naim</p>
          <p className="text-xs text-muted-foreground">naim@nsh.de</p>
        </div>
      </div>
    </header>
  )
}

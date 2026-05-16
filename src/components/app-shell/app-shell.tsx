import { ReactNode } from "react"
import { IpadSidebar } from "@/components/app-shell/ipad-sidebar"
import { MobileBottomNav } from "@/components/app-shell/mobile-bottom-nav"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="flex">
        <IpadSidebar />
        <main className="min-h-dvh w-full max-w-4xl p-4 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

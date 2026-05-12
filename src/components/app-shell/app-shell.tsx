import { ReactNode } from "react"
import { IpadSidebar } from "@/components/app-shell/ipad-sidebar"
import { MobileBottomNav } from "@/components/app-shell/mobile-bottom-nav"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl">
        <IpadSidebar />
        <main className="w-full p-4 pb-24 md:p-8">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

import { ReactNode } from "react"
import { IpadSidebar } from "@/components/app-shell/ipad-sidebar"
import { MobileBottomNav } from "@/components/app-shell/mobile-bottom-nav"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-muted/40 md:h-dvh md:overflow-hidden">
      <div className="flex min-h-dvh min-w-0 overflow-x-hidden md:h-dvh md:min-h-0">
        <IpadSidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden p-3 pb-28 sm:p-4 md:h-dvh md:overflow-y-auto md:overscroll-contain md:p-6 md:pb-6">
          <div className="mx-auto w-full max-w-5xl">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

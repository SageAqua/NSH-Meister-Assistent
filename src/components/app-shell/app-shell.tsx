import { ReactNode } from "react"
import { IpadSidebar } from "@/components/app-shell/ipad-sidebar"
import { MobileBottomNav } from "@/components/app-shell/mobile-bottom-nav"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background md:h-dvh md:overflow-hidden">
      <div className="flex min-h-dvh md:h-dvh md:min-h-0">
        <IpadSidebar />
        <main className="min-w-0 flex-1 p-3 pb-24 sm:p-4 md:h-dvh md:overflow-y-auto md:overscroll-contain md:p-8 md:pb-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

import { ReactNode } from "react"
import { IpadSidebar } from "@/components/app-shell/ipad-sidebar"
import { MobileBottomNav } from "@/components/app-shell/mobile-bottom-nav"
import { TopNavbar } from "@/components/app-shell/top-navbar"

export function AppShell({
  children,
  userName,
  userEmail,
}: {
  children: ReactNode
  userName: string
  userEmail: string
}) {
  return (
    <div className="min-h-dvh overflow-x-hidden md:h-dvh md:overflow-hidden">
      <div className="flex min-h-dvh min-w-0 overflow-x-hidden md:h-dvh md:min-h-0">
        <IpadSidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:flex md:h-dvh md:flex-col md:pb-0">
          {/* Mobile sticky header */}
          <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:hidden">
            <img src="/logo.png" alt="NSH" className="size-8 rounded-lg bg-white object-contain ring-1 ring-border" />
            <p className="text-sm font-black">NSH Renovierung</p>
          </div>
          {/* Desktop top navbar */}
          <TopNavbar userName={userName} userEmail={userEmail} />
          {/* Page content */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-6 xl:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

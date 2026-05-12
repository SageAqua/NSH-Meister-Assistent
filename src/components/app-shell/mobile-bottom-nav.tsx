import Link from "next/link"
import { mainNav } from "@/data/navigation"

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 gap-2 border-t bg-background p-2 md:hidden">
      {mainNav.slice(0, 6).map((item) => (
        <Link key={item.href} href={item.href} className="flex min-h-[56px] flex-col items-center justify-center rounded-md text-center hover:bg-accent">
          <span className="text-sm font-medium">{item.labelDe}</span>
          <span className="text-[10px] text-muted-foreground">{item.labelSq}</span>
        </Link>
      ))}
    </nav>
  )
}

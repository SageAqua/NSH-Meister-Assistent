import Link from "next/link"
import { mainNav } from "@/data/navigation"

export function IpadSidebar() {
  return (
    <aside className="hidden w-72 border-r bg-muted/20 p-4 md:block">
      <h2 className="mb-4 text-lg font-semibold">Navigation</h2>
      <nav className="space-y-2">
        {mainNav.map((item) => (
          <Link key={item.href} href={item.href} className="flex min-h-[56px] flex-col justify-center rounded-lg border bg-background px-4 hover:bg-accent">
            <span className="font-medium">{item.labelDe}</span>
            {item.labelSq ? <span className="text-xs text-muted-foreground">{item.labelSq}</span> : null}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

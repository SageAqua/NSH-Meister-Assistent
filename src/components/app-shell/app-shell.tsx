"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-config";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-white text-black md:grid md:grid-cols-[280px_1fr]"> 
    <aside className="hidden md:block border-r bg-zinc-50 p-4">
      <h1 className="mb-6 rounded-2xl bg-red-600 p-4 text-2xl font-bold text-white">NSH Meister-Assistent</h1>
      <nav className="space-y-3">{navItems.map(i => <Link key={i.href} href={i.href} className={`block rounded-2xl p-4 min-h-14 ${pathname===i.href?"bg-red-50 border border-red-200":"bg-white border"}`}><p className="font-semibold">{i.label}</p><p className="text-sm text-zinc-500">{i.sublabel}</p></Link>)}</nav>
    </aside>
    <main className="pb-24 md:pb-8 p-4">{children}</main>
    <nav className="fixed bottom-0 inset-x-0 md:hidden grid grid-cols-5 gap-1 border-t bg-white p-2">{navItems.slice(0,5).map(i => <Link key={i.href} href={i.href} className={`min-h-14 rounded-xl flex items-center justify-center text-sm ${pathname===i.href?"bg-red-100":"bg-zinc-100"}`}>{i.label}</Link>)}</nav>
  </div>;
}

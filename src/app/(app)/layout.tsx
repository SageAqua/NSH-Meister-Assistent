import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell/app-shell"
import { createClient } from "@/lib/supabase/server"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")

  const name = data.user.user_metadata?.full_name ?? data.user.email ?? "Naim"
  const email = data.user.email ?? ""

  return <AppShell userName={name} userEmail={email}>{children}</AppShell>
}

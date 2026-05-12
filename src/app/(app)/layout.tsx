import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true; // TODO: replace with Supabase auth session check.
  if (!isAuthenticated) redirect("/login");
  return <AppShell>{children}</AppShell>;
}

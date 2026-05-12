import { EmptyStateCard } from "@/components/app-shell/state-cards";

export default function Page() {
  return (
    <section className="space-y-4">
      <h2 className="text-4xl font-bold capitalize">notizen</h2>
      <EmptyStateCard title="Noch keine Daten" subtitle="Shtoni të dhënat e para për këtë faqe." />
    </section>
  );
}

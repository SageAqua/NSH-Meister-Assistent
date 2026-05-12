import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default async function BaustelleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Baustelle #{id}</h1>
      <Badge>Aktiv / Aktiv</Badge>
    </div>
  )
}

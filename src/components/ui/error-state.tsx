import { AlertTriangle } from "lucide-react"

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="size-5" /> Fehler
      </div>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  )
}

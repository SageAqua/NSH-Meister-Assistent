"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CalendarPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { delayProjectWorkFromEvent } from "@/app/actions/orders"

export function ProjectDelayButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function delayDay() {
    setError("")
    startTransition(async () => {
      const result = await delayProjectWorkFromEvent(eventId)
      if (result?.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 w-full gap-1.5 text-xs sm:w-auto"
        onClick={delayDay}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CalendarPlus className="size-3.5" />}
        <span className="nsh-i18n nsh-i18n-button" data-sq="Sot jo">Heute nicht</span>
      </Button>
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  )
}

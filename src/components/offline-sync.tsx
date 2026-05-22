"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { saveTodayWorkSession } from "@/app/actions/orders"
import {
  getQueuedTodayWorkSessions,
  removeQueuedTodayWorkSession,
} from "@/lib/offline-db"

export function OfflineSync() {
  const router = useRouter()
  const syncingRef = useRef(false)

  useEffect(() => {
    async function sync() {
      if (syncingRef.current || !navigator.onLine) return
      syncingRef.current = true
      let changed = false

      try {
        const queued = await getQueuedTodayWorkSessions()
        for (const session of queued) {
          const result = await saveTodayWorkSession({
            projectId: session.projectId,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            helpersCount: session.helpersCount,
          })

          if (result.error) break
          await removeQueuedTodayWorkSession(session.id)
          changed = true
        }
      } finally {
        syncingRef.current = false
        window.dispatchEvent(new Event("nsh-offline-queue-changed"))
        if (changed) router.refresh()
      }
    }

    const handleOnline = () => {
      void sync()
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("nsh-offline-queue-changed", handleOnline)
    void sync()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("nsh-offline-queue-changed", handleOnline)
    }
  }, [router])

  return null
}

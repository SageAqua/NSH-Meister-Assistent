"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BriefcaseBusiness, CheckCircle2, Clock, Loader2, MapPin, Plus } from "lucide-react"
import { saveTodayWorkSession } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Customer, Project } from "@/types"
import {
  cacheOfflineProjects,
  enqueueTodayWorkSession,
  getOfflineProjects,
  getQueuedTodayWorkSessions,
} from "@/lib/offline-db"

type ProjectWithCustomer = Project & { customers: Customer | null }

const DURATIONS = [
  { label: "2 Std", hours: 2 },
  { label: "4 Std", hours: 4 },
  { label: "6 Std", hours: 6 },
  { label: "Ganzer Tag", hours: 8 },
]

function addHours(time: string, hours: number) {
  const [h, m] = time.split(":").map(Number)
  const minutes = h * 60 + m + hours * 60
  const end = Math.min(minutes, 23 * 60 + 59)
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`
}

function projectLabel(project: ProjectWithCustomer) {
  return project.customers?.name ?? project.address ?? project.service_type
}

function projectSubtitle(project: ProjectWithCustomer) {
  return [project.service_type, project.address, project.customers?.city].filter(Boolean).join(" · ")
}

export function TodayWorkPlanner({
  projects,
  today,
}: {
  projects: ProjectWithCustomer[]
  today: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [displayProjects, setDisplayProjects] = useState(projects)
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "")
  const [startTime, setStartTime] = useState("08:00")
  const [durationHours, setDurationHours] = useState(8)
  const [helpersCount, setHelpersCount] = useState(projects[0]?.helpers_count ?? 0)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [offlineSaved, setOfflineSaved] = useState(false)
  const [queuedCount, setQueuedCount] = useState(0)
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine)

  const selectedProject = useMemo(
    () => displayProjects.find((project) => project.id === projectId) ?? displayProjects[0],
    [projectId, displayProjects]
  )
  const endTime = addHours(startTime, durationHours)

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine)
    window.addEventListener("online", updateOnline)
    window.addEventListener("offline", updateOnline)
    return () => {
      window.removeEventListener("online", updateOnline)
      window.removeEventListener("offline", updateOnline)
    }
  }, [])

  useEffect(() => {
    if (projects.length > 0) {
      void cacheOfflineProjects(projects)
      Promise.resolve().then(() => {
        setDisplayProjects(projects)
        setProjectId((current) => current || projects[0].id)
      })
      return
    }

    getOfflineProjects().then((cached) => {
      if (cached.length === 0) return
      setDisplayProjects(cached)
      setProjectId((current) => current || cached[0].id)
      setHelpersCount((current) => current || cached[0].helpers_count || 0)
    })
  }, [projects])

  useEffect(() => {
    async function updateQueueCount() {
      const queued = await getQueuedTodayWorkSessions()
      setQueuedCount(queued.length)
    }

    const handler = () => {
      void updateQueueCount()
    }

    handler()
    window.addEventListener("nsh-offline-queue-changed", handler)
    window.addEventListener("online", handler)
    return () => {
      window.removeEventListener("nsh-offline-queue-changed", handler)
      window.removeEventListener("online", handler)
    }
  }, [])

  async function saveOffline() {
    if (!selectedProject) return
    await enqueueTodayWorkSession({
      projectId: selectedProject.id,
      date: today,
      startTime,
      endTime,
      helpersCount,
    })
    setOfflineSaved(true)
    setDone(false)
    window.dispatchEvent(new Event("nsh-offline-queue-changed"))
  }

  function submit() {
    if (!selectedProject) return
    setError("")
    setDone(false)
    setOfflineSaved(false)

    if (!navigator.onLine) {
      void saveOffline()
      return
    }

    startTransition(async () => {
      try {
        const result = await saveTodayWorkSession({
          projectId: selectedProject.id,
          date: today,
          startTime,
          endTime,
          helpersCount,
        })

        if (result.error) {
          if (!navigator.onLine) {
            await saveOffline()
          } else {
            setError(result.error)
          }
        } else {
          setDone(true)
          router.refresh()
        }
      } catch {
        await saveOffline()
      }
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm lg:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-black text-foreground">Heute arbeiten</p>
          <p className="text-xs text-muted-foreground">Baustelle und Dauer waehlen, Kalender macht den Rest.</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BriefcaseBusiness className="size-5" />
        </div>
      </div>

      {displayProjects.length === 0 ? (
        <Link href="/neuer-auftrag/baustelle" className="flex min-h-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/35 bg-primary/5 text-center text-primary">
          <Plus className="size-5" />
          <span className="mt-1 text-sm font-black">Erste Baustelle anlegen</span>
        </Link>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Wo?</span>
            <select
              value={projectId}
              onChange={(event) => {
                const next = displayProjects.find((project) => project.id === event.target.value)
                setProjectId(event.target.value)
                setHelpersCount(next?.helpers_count ?? 0)
              }}
              className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-black outline-none focus:border-primary"
            >
              {displayProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {projectLabel(project)}
                </option>
              ))}
            </select>
          </label>

          {selectedProject && (
            <div className="rounded-xl bg-muted/45 px-3 py-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">{projectLabel(selectedProject)}</p>
              <p className="mt-0.5 flex items-center gap-1">
                <MapPin className="size-3.5" />
                <span className="truncate">{projectSubtitle(selectedProject) || "Keine Adresse hinterlegt"}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-[1fr_1fr] gap-2">
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Start</span>
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-black outline-none focus:border-primary"
              />
            </label>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Bis</span>
              <div className="flex h-12 items-center rounded-xl border-2 border-border bg-muted/35 px-3 text-sm font-black">
                <Clock className="mr-2 size-4 text-muted-foreground" />
                {endTime}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map((duration) => (
              <button
                key={duration.hours}
                type="button"
                onClick={() => setDurationHours(duration.hours)}
                className={cn(
                  "min-h-11 rounded-xl border-2 px-2 text-sm font-black transition-colors",
                  durationHours === duration.hours
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background"
                )}
              >
                {duration.label}
              </button>
            ))}
          </div>

          <div>
            <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Helfer</span>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setHelpersCount(count)}
                  className={cn(
                    "h-10 rounded-xl border-2 text-sm font-black",
                    helpersCount === count ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">{error}</p>}
          {done && (
            <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
              <CheckCircle2 className="size-4" />
              Heute ist eingetragen.
            </p>
          )}
          {offlineSaved && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
              Offline gespeichert. Wird automatisch synchronisiert.
            </p>
          )}
          {queuedCount > 0 && (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
              {queuedCount} offline gespeicherte {queuedCount === 1 ? "Aenderung wartet" : "Aenderungen warten"} auf Sync.
            </p>
          )}

          <Button size="touch" className="w-full gap-2" onClick={submit} disabled={isPending || !selectedProject}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            {isOnline ? "Eintragen" : "Offline speichern"}
          </Button>
        </div>
      )}
    </section>
  )
}

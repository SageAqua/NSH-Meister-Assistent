import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  HardHat,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Users,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { markTaskDone } from "@/app/actions/orders"
import type { CalendarEvent, Customer, Project, Task } from "@/types"

type ProjectFull = Project & { customers: Customer | null }

function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

function time(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function serviceName(service: string) {
  const labels: Record<string, string> = {
    vinyl: "Vinyl verlegen",
    klickvinyl: "Klickvinyl",
    klebevinyl: "Klebevinyl",
    laminat: "Laminat",
    waende: "Waende streichen",
    decke: "Decke streichen",
    spachtel: "Spachteln",
    trockenbau: "Trockenbau",
  }
  return labels[service] ?? service
}

function TodayEvents({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed bg-card p-5 text-center">
        <CalendarDays className="mx-auto mb-2 size-9 text-muted-foreground" />
        <p className="text-lg font-black">Heute keine Termine.</p>
        <p className="mt-1 text-sm text-muted-foreground">Der Tag ist frei oder noch nicht geplant.</p>
        <Link href="/heute?new-event=1" className="mt-4 inline-flex">
          <Button size="touch" className="gap-2">
            <Plus className="size-5" /> Termin eintragen
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const customer = event.projects?.customers
        const address = event.projects?.address ?? customer?.address
        const place = [address, customer?.city].filter(Boolean).join(", ")

        return (
          <div key={event.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-lg font-black text-primary">
                  {time(event.start_time)} - {time(event.end_time)}
                </p>
                <h3 className="mt-1 text-xl font-black leading-tight">{event.title}</h3>
                {customer && <p className="mt-1 font-semibold text-muted-foreground">{customer.name}</p>}
                {place && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" /> {place}
                  </p>
                )}
              </div>
              {event.status === "erledigt" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-700">
                  <CheckCircle2 className="size-4" /> Erledigt
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {place && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(place)}`} target="_blank" rel="noreferrer">
                  <Button size="touch" className="gap-2">
                    <Navigation className="size-5" /> Navigation
                  </Button>
                </a>
              )}
              {customer?.phone && (
                <a href={`tel:${customer.phone}`}>
                  <Button size="touch" variant="outline" className="gap-2">
                    <Phone className="size-5" /> Anrufen
                  </Button>
                </a>
              )}
              {event.project_id && (
                <Link href={`/baustellen/${event.project_id}`}>
                  <Button size="touch" variant="outline" className="gap-2">
                    <HardHat className="size-5" /> Baustelle
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function OpenTasks({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <p className="rounded-lg border bg-card p-4 text-center font-semibold text-muted-foreground">Keine offenen Aufgaben.</p>
  }

  return (
    <div className="space-y-2">
      {tasks.slice(0, 4).map((task) => (
        <form key={task.id} action={markTaskDone.bind(null, task.id)}>
          <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left shadow-sm">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary">
              <CheckCircle2 className="size-4 text-primary" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-black">{task.title}</span>
              {task.projects && (
                <span className="block truncate text-sm text-muted-foreground">
                  {task.projects.address ?? serviceName(task.projects.service_type)}
                </span>
              )}
            </span>
          </button>
        </form>
      ))}
    </div>
  )
}

function ActiveProjects({ projects }: { projects: ProjectFull[] }) {
  if (projects.length === 0) {
    return <p className="rounded-lg border bg-card p-4 text-center font-semibold text-muted-foreground">Keine aktiven Baustellen.</p>
  }

  return (
    <div className="space-y-2">
      {projects.slice(0, 5).map((project) => (
        <Link key={project.id} href={`/baustellen/${project.id}`}>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Building2 className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-black">{project.customers?.name ?? "Ohne Kunde"}</p>
              <p className="truncate text-sm text-muted-foreground">
                {serviceName(project.service_type)}
                {project.address ? ` - ${project.address}` : ""}
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  title,
  text,
  primary = false,
}: {
  href: string
  icon: typeof Plus
  title: string
  text: string
  primary?: boolean
}) {
  return (
    <Link href={href}>
      <div className={`flex min-h-28 items-center gap-4 rounded-lg border p-4 shadow-sm transition-colors ${primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card hover:bg-muted"}`}>
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${primary ? "bg-white/15" : "bg-muted"}`}>
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-lg font-black leading-tight">{title}</p>
          <p className={`mt-1 text-sm ${primary ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{text}</p>
        </div>
      </div>
    </Link>
  )
}

export default async function HeutePage({
  searchParams,
}: {
  searchParams: Promise<{ "new-event"?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const today = new Date()
  const todayStr = formatDateKey(today)
  const startOfDay = `${todayStr}T00:00:00`
  const endOfDay = `${todayStr}T23:59:59`

  if (params["new-event"]) {
    return (
      <div className="rounded-lg border bg-card p-5">
        <h1 className="text-2xl font-black">Termin eintragen</h1>
        <p className="mt-2 text-muted-foreground">
          Termine werden jetzt am einfachsten ueber Neuer Auftrag mit Startdatum angelegt.
        </p>
        <Link href="/neuer-auftrag" className="mt-4 inline-flex">
          <Button size="touch" className="gap-2">
            <Plus className="size-5" /> Auftrag oder Termin anlegen
          </Button>
        </Link>
      </div>
    )
  }

  const [
    { data: eventsRaw },
    { data: tasksRaw },
    { data: projectsRaw },
  ] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("*, projects(*, customers(*))")
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay)
      .neq("status", "abgesagt")
      .order("start_time"),
    supabase
      .from("tasks")
      .select("*, projects(*)")
      .eq("is_done", false)
      .order("due_date", { ascending: true })
      .limit(6),
    supabase
      .from("projects")
      .select("*, customers(*)")
      .in("status", ["in_arbeit", "geplant"])
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const events = (eventsRaw ?? []) as CalendarEvent[]
  const tasks = (tasksRaw ?? []) as Task[]
  const projects = (projectsRaw ?? []) as ProjectFull[]
  const dateStr = today.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="space-y-5">
      <header className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-primary">Heute</p>
            <h1 className="mt-1 text-3xl font-black leading-tight">Hallo Naim</h1>
            <p className="mt-1 text-base capitalize text-muted-foreground">{dateStr}</p>
          </div>
          <img src="/logo.png" alt="NSH Renovierung" className="size-14 rounded-lg bg-white object-contain ring-1 ring-border" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction href="/neuer-auftrag" icon={Plus} title="Neuer Auftrag" text="Freitext, Kunde, Termin" primary />
        <QuickAction href="/baustellen" icon={Building2} title="Baustellen" text="Alle Arbeiten ansehen" />
        <QuickAction href="/kunden" icon={Users} title="Kunden" text="Telefon und Adresse" />
        <QuickAction href="/notizen" icon={FileText} title="Notiz" text="Schnell etwas merken" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <CalendarDays className="size-6 text-primary" /> Termine heute
          </h2>
          <Link href="/kalender" className="text-sm font-black text-primary">Kalender</Link>
        </div>
        <TodayEvents events={events} />
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <HardHat className="size-6 text-primary" /> Laufende Baustellen
            </h2>
            <Link href="/baustellen" className="text-sm font-black text-primary">Alle</Link>
          </div>
          <ActiveProjects projects={projects} />
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <ClipboardList className="size-6 text-primary" /> Aufgaben
          </h2>
          <OpenTasks tasks={tasks} />
        </section>
      </div>
    </div>
  )
}

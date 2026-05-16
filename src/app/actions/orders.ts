"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { VinylOrderForm, CalendarPlanDay } from "@/types"

export async function saveVinylOrder(form: VinylOrderForm, plan: CalendarPlanDay[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  let customerId = form.customerId

  // Create customer if new
  if (form.isNewCustomer && form.customerName) {
    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        user_id: user.id,
        name: form.customerName,
        phone: form.customerPhone ?? null,
        address: form.customerAddress ?? null,
        city: form.customerCity ?? null,
      })
      .select("id")
      .single()
    if (error) return { error: "Kunde konnte nicht gespeichert werden." }
    customerId = customer.id
  }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      customer_id: customerId ?? null,
      service_type: "vinyl",
      status: "geplant",
      address: form.customerAddress ?? null,
      area_m2: form.area ?? null,
      vinyl_type: form.vinylType ?? null,
      object_type: form.objectType ?? null,
      ground_condition: form.groundCondition ?? null,
      extras: form.extras,
      material_supply: form.material ?? null,
      helpers_count: 0,
    })
    .select("id")
    .single()

  if (projectError) return { error: "Projekt konnte nicht gespeichert werden." }

  // Create calendar events from plan
  if (plan.length > 0) {
    const events = plan.map((day) => ({
      user_id: user.id,
      project_id: project.id,
      title: day.title,
      start_time: `${day.date}T${day.startTime}:00`,
      end_time: `${day.date}T${day.endTime}:00`,
      status: "geplant" as const,
      helpers_count: day.helpers,
    }))

    const { error: eventsError } = await supabase.from("calendar_events").insert(events)
    if (eventsError) return { error: "Termine konnten nicht gespeichert werden." }
  }

  // Create standard tasks
  const tasks = [
    { title: "Angebot verschicken", due_date: new Date().toISOString().split("T")[0] },
    { title: "Material bestellen", due_date: form.startDate ?? null },
    { title: "Abnahme mit Kunde durchführen", due_date: null },
    { title: "Rechnung stellen", due_date: null },
  ]

  await supabase.from("tasks").insert(
    tasks.map((t) => ({ ...t, user_id: user.id, project_id: project.id }))
  )

  redirect(`/baustellen/${project.id}`)
}

export async function markEventDone(eventId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("calendar_events")
    .update({ status: "erledigt" })
    .eq("id", eventId)
    .eq("user_id", user.id)

  revalidatePath("/heute")
  revalidatePath("/kalender")
}

export async function markTaskDone(taskId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("tasks")
    .update({ is_done: true })
    .eq("id", taskId)
    .eq("user_id", user.id)

  revalidatePath("/heute")
}

export async function saveNote(content: string, type: string, projectId?: string, customerId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  const { error } = await supabase.from("notes").insert({
    user_id: user.id,
    content,
    type,
    project_id: projectId ?? null,
    customer_id: customerId ?? null,
  })

  if (error) return { error: "Notiz konnte nicht gespeichert werden." }
  return { success: true }
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("calendar_events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", user.id)

  revalidatePath("/heute")
  revalidatePath("/kalender")
}

export async function updateCalendarEvent(data: {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: data.title,
      start_time: `${data.date}T${data.startTime}:00`,
      end_time: `${data.date}T${data.endTime}:00`,
    })
    .eq("id", data.id)
    .eq("user_id", user.id)

  if (error) return { error: "Änderung fehlgeschlagen." }
  revalidatePath("/heute")
  revalidatePath("/kalender")
  return {}
}

export async function saveUniversalOrder(data: {
  serviceId: string
  area: number
  unit: string
  workersCount: number
  helpersCount: number
  startDate: string
  customerId?: string
  plan: { date: string; title: string; startTime: string; endTime: string }[]
}): Promise<{ error?: string; projectId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  let address: string | null = null
  if (data.customerId) {
    const { data: customer } = await supabase.from("customers").select("address").eq("id", data.customerId).single()
    address = customer?.address ?? null
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      customer_id: data.customerId ?? null,
      service_type: data.serviceId,
      status: "geplant",
      address,
      area_m2: data.area,
      helpers_count: data.helpersCount,
      extras: {},
    })
    .select("id")
    .single()

  if (projectError) return { error: "Projekt konnte nicht gespeichert werden." }

  if (data.plan.length > 0) {
    await supabase.from("calendar_events").insert(
      data.plan.map((day) => ({
        user_id: user.id,
        project_id: project.id,
        title: day.title,
        start_time: `${day.date}T${day.startTime}:00`,
        end_time: `${day.date}T${day.endTime}:00`,
        status: "geplant" as const,
        helpers_count: data.helpersCount,
      }))
    )
  }

  await supabase.from("tasks").insert([
    { user_id: user.id, project_id: project.id, title: "Angebot verschicken", due_date: new Date().toISOString().split("T")[0] },
    { user_id: user.id, project_id: project.id, title: "Material bestellen", due_date: data.startDate },
    { user_id: user.id, project_id: project.id, title: "Rechnung stellen", due_date: null },
  ])

  revalidatePath("/heute")
  revalidatePath("/kalender")
  revalidatePath("/baustellen")
  return { projectId: project.id }
}

export async function saveCustomer(data: {
  name: string
  phone?: string
  address?: string
  city?: string
  notes?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  const { error } = await supabase.from("customers").insert({
    user_id: user.id,
    name: data.name,
    phone: data.phone ?? null,
    address: data.address ?? null,
    city: data.city ?? null,
    notes: data.notes ?? null,
  })

  if (error) return { error: "Kontakt konnte nicht gespeichert werden." }
  revalidatePath("/kunden")
  return {}
}

export async function savePriceCalculation(data: {
  serviceType: string
  areaMm: number
  difficulty: string
  extras: Record<string, boolean>
  priceLow: number
  priceNormal: number
  priceHigh: number
  customerId?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  await supabase.from("price_calculations").insert({
    user_id: user.id,
    customer_id: data.customerId ?? null,
    service_type: data.serviceType,
    area_m2: data.areaMm,
    difficulty: data.difficulty,
    extras: data.extras,
    price_low: data.priceLow,
    price_normal: data.priceNormal,
    price_high: data.priceHigh,
  })
}

export async function saveCalendarEvent(data: {
  title: string
  date: string
  startTime: string
  endTime: string
  projectId?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht angemeldet." }

  const { error } = await supabase.from("calendar_events").insert({
    user_id: user.id,
    project_id: data.projectId ?? null,
    title: data.title,
    start_time: `${data.date}T${data.startTime}:00`,
    end_time: `${data.date}T${data.endTime}:00`,
    status: "geplant",
    helpers_count: 0,
  })

  if (error) return { error: "Termin konnte nicht gespeichert werden." }
  revalidatePath("/heute")
  return {}
}

export async function updateProjectStatus(projectId: string, status: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId)
    .eq("user_id", user.id)
}

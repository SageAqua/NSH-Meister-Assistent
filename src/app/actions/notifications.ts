"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveSubscription(subscription: {
  endpoint?: string
  keys?: Record<string, string>
  expirationTime?: number | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }
  if (!subscription.endpoint) return { error: "Invalid subscription" }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      subscription,
    },
    { onConflict: "endpoint" }
  )

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteSubscription(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", user.id)

  return { success: true }
}

export async function updateNotificationPrefs(
  endpoint: string,
  prefs: { notify_1day?: boolean; notify_1hour?: boolean }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  await supabase
    .from("push_subscriptions")
    .update(prefs)
    .eq("endpoint", endpoint)
    .eq("user_id", user.id)

  revalidatePath("/einstellungen")
  return { success: true }
}

export async function getSubscriptionPrefs(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("push_subscriptions")
    .select("notify_1day, notify_1hour")
    .eq("endpoint", endpoint)
    .eq("user_id", user.id)
    .single()

  return data as { notify_1day: boolean; notify_1hour: boolean } | null
}

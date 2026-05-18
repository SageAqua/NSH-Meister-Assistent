"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  saveSubscription,
  deleteSubscription,
  updateNotificationPrefs,
  getSubscriptionPrefs,
} from "@/app/actions/notifications"

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = window.atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

type Status = "loading" | "unsupported" | "denied" | "granted" | "default"
type Prefs = { notify_1day: boolean; notify_1hour: boolean }

export function NotificationButton() {
  const [status, setStatus] = useState<Status>("loading")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [sub, setSub] = useState<PushSubscription | null>(null)
  const [prefs, setPrefs] = useState<Prefs>({ notify_1day: true, notify_1hour: true })
  const [pending, setPending] = useState(false)

  useEffect(() => {
    async function init() {
      if (typeof window === "undefined") return
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported")
        return
      }
      const perm = Notification.permission
      setStatus(perm as Status)
      if (perm === "granted") {
        const reg = await navigator.serviceWorker.ready
        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          setIsSubscribed(true)
          setSub(existing)
          const savedPrefs = await getSubscriptionPrefs(existing.endpoint)
          if (savedPrefs) setPrefs(savedPrefs)
        }
      }
    }
    init()
  }, [])

  async function handleSubscribe() {
    setPending(true)
    try {
      const perm = await Notification.requestPermission()
      setStatus(perm as Status)
      if (perm !== "granted") { setPending(false); return }

      const reg = await navigator.serviceWorker.ready
      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      const result = await saveSubscription(newSub.toJSON())
      if (!result?.error) {
        setIsSubscribed(true)
        setSub(newSub)
      }
    } catch (err) {
      console.error("Subscribe error:", err)
    }
    setPending(false)
  }

  async function handleUnsubscribe() {
    if (!sub) return
    setPending(true)
    await sub.unsubscribe()
    await deleteSubscription(sub.endpoint)
    setIsSubscribed(false)
    setSub(null)
    setPending(false)
  }

  async function togglePref(key: keyof Prefs) {
    if (!sub) return
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    await updateNotificationPrefs(sub.endpoint, { [key]: next[key] })
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Wird geladen...
      </div>
    )
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        Dein Browser unterstuetzt keine Push-Benachrichtigungen. Installiere die App oder nutze Chrome auf Android.
      </div>
    )
  }

  if (status === "denied") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Benachrichtigungen sind blockiert. Bitte in den Browser-Einstellungen freigeben und dann die Seite neu laden.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={pending}
        className={cn(
          "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors disabled:opacity-60",
          isSubscribed
            ? "border-primary bg-primary/5 hover:bg-primary/10"
            : "border-border hover:bg-accent"
        )}
      >
        <div className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          isSubscribed ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {pending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : isSubscribed ? (
            <Bell className="size-6" />
          ) : (
            <BellOff className="size-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-bold">
            {isSubscribed ? "Benachrichtigungen aktiv" : "Benachrichtigungen aktivieren"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isSubscribed
              ? "Tippen zum Deaktivieren"
              : "Erinnerungen vor Terminen auf diesem Geraet erhalten"}
          </p>
        </div>
      </button>

      {isSubscribed && (
        <div className="space-y-2">
          {(
            [
              { key: "notify_1day" as const, label: "1 Tag vorher", sub: "Erinnerung am Vortag" },
              { key: "notify_1hour" as const, label: "1 Stunde vorher", sub: "Erinnerung kurz davor" },
            ] as const
          ).map(({ key, label, sub: subLabel }) => (
            <button
              key={key}
              onClick={() => togglePref(key)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-accent"
            >
              <div className="text-left">
                <p className="text-sm font-bold">{label}</p>
                <p className="text-xs text-muted-foreground">{subLabel}</p>
              </div>
              <div className={cn("relative h-6 w-11 rounded-full transition-colors", prefs[key] ? "bg-primary" : "bg-muted")}>
                <div
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                    prefs[key] ? "left-[calc(100%-1.375rem)]" : "left-0.5"
                  )}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

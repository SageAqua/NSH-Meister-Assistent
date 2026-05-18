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
        <Loader2 className="size-4 animate-spin" />
        <span className="nsh-i18n" data-sq="Duke u ngarkuar...">Wird geladen...</span>
      </div>
    )
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <span className="nsh-i18n" data-sq="Shfletuesi yt nuk mbështet njoftimet push. Instalo app-in ose përdor Chrome në Android.">
          Dein Browser unterstützt keine Push-Benachrichtigungen. Installiere die App oder nutze Chrome auf Android.
        </span>
      </div>
    )
  }

  if (status === "denied") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <span className="nsh-i18n" data-sq="Njoftimet janë bllokuar. Lejoji në cilësimet e shfletuesit dhe ringarko faqen.">
          Benachrichtigungen sind blockiert. Bitte in den Browser-Einstellungen freigeben und dann die Seite neu laden.
        </span>
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
            <span className="nsh-i18n" data-sq={isSubscribed ? "Njoftimet aktive" : "Aktivizo njoftimet"}>
              {isSubscribed ? "Benachrichtigungen aktiv" : "Benachrichtigungen aktivieren"}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {isSubscribed
              ? <span className="nsh-i18n" data-sq="Shtyp për t'i çaktivizuar">Tippen zum Deaktivieren</span>
              : <span className="nsh-i18n" data-sq="Merr kujtime për terminet në këtë pajisje">Erinnerungen vor Terminen auf diesem Gerät erhalten</span>}
          </p>
        </div>
      </button>

      {isSubscribed && (
        <div className="space-y-2">
          {(
            [
              { key: "notify_1day" as const, label: "1 Tag vorher", labelSq: "1 ditë përpara", sub: "Erinnerung am Vortag", subSq: "Kujtim një ditë më parë" },
              { key: "notify_1hour" as const, label: "1 Stunde vorher", labelSq: "1 orë përpara", sub: "Erinnerung kurz davor", subSq: "Kujtim pak para terminit" },
            ] as const
          ).map(({ key, label, labelSq, sub: subLabel, subSq }) => (
            <button
              key={key}
              onClick={() => togglePref(key)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-accent"
            >
              <div className="text-left">
                <p className="text-sm font-bold"><span className="nsh-i18n" data-sq={labelSq}>{label}</span></p>
                <p className="text-xs text-muted-foreground"><span className="nsh-i18n" data-sq={subSq}>{subLabel}</span></p>
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

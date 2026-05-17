"use client"

import { useState, useTransition } from "react"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertTriangle } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-[minmax(0,1fr)_28rem]">
      <div className="hidden min-h-dvh flex-col justify-between bg-sidebar p-8 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-lg bg-white">
            <img src="/logo.png" alt="NSH Renovierung" className="size-14 object-contain" />
          </div>
          <div>
            <p className="text-xl font-black">NSH Meister</p>
            <p className="text-sm text-sidebar-foreground/55">Renovierung Vechta</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-sidebar-primary">Assistent</p>
          <h1 className="mt-3 max-w-xl text-5xl font-black leading-tight">Alles fuer Baustellen, Kunden und Termine an einem Ort.</h1>
        </div>
        <p className="text-sm text-sidebar-foreground/45">NSH Renovierung</p>
      </div>
      <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-border">
          <img src="/logo.png" alt="NSH Renovierung" className="size-20 object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">NSH Meister-Assistent</h1>
          <p className="text-muted-foreground">Naim Shala Renovierung · Vechta</p>
        </div>
      </div>

      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Anmelden / Hyrje</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              name="email"
              type="email"
              placeholder="E-Mail"
              autoComplete="email"
              required
              className="h-12 text-base"
            />
            <Input
              name="password"
              type="password"
              placeholder="Passwort / Fjalëkalimi"
              autoComplete="current-password"
              required
              className="h-12 text-base"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="touch"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Lädt..." : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

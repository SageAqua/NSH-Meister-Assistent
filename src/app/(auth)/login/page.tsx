import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Login / Hyrje</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="E-Mail" className="min-h-[56px]" />
          <Input placeholder="Passwort" type="password" className="min-h-[56px]" />
          <Button className="min-h-[56px] w-full">Anmelden</Button>
        </CardContent>
      </Card>
    </div>
  )
}

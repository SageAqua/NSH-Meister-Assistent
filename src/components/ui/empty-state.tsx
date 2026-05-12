import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">{description}</CardContent>
    </Card>
  )
}

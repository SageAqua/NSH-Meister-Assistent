import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState({ variant = "page" }: { variant?: "page" | "list" | "cards" }) {
  if (variant === "list") {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "cards") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-8 w-1/3 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

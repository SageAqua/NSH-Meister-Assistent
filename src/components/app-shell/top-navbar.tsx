export function TopNavbar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const initial = userName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-40 hidden h-14 items-center justify-end gap-4 border-b border-border bg-background/95 px-6 backdrop-blur md:flex">
      <div className="flex items-center gap-2.5 border-l border-border pl-4">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-black text-primary-foreground">
          {initial}
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-bold leading-tight text-foreground">{userName}</p>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>
      </div>
    </header>
  )
}

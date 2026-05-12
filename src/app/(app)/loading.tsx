export default function AppLoading() {
  return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-zinc-100" />)}</div>;
}

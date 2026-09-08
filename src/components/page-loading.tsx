// Lightweight, dependency-free loading skeleton shown by every route's
// loading.tsx while its Server Component fetches data. All pages in this
// app are `force-dynamic` (always fresh from Supabase, never cached), so
// without this the user would stare at a blank screen on every navigation
// — this makes the app *feel* instant even though the data fetch itself
// still takes the same time.
export function PageLoading({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-7 w-40 animate-pulse rounded-lg bg-black/10 dark:bg-white/10" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-border bg-black/5 dark:bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

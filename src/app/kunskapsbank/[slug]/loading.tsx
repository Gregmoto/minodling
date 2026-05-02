function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}

export default function ArticleLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <main className="flex-1 bg-cream-50">
        <div className="h-56 sm:h-72 bg-gray-100 animate-pulse" />
        <div className="container-main py-10 max-w-3xl">
          <div className="space-y-6">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-40" />
            <div className="space-y-3 pt-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-3 pt-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

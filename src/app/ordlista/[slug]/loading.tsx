function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}

export default function OrdlistaLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <main className="flex-1 bg-cream-50">
        <div className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-10">
          <div className="container-main max-w-3xl">
            <Skeleton className="h-4 w-40 mb-6" />
            <Skeleton className="h-9 w-1/2 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="container-main py-8 max-w-3xl space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          <Skeleton className="h-4 w-3/4" />
        </div>
      </main>
    </div>
  );
}

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}
export default function DagbokLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8">
          <div className="flex items-center justify-between mb-6">
            <Sk className="h-8 w-36" />
            <Sk className="h-9 w-32 rounded-xl" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Sk className="h-12 w-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Sk className="h-5 w-1/3" />
                    <Sk className="h-4 w-1/4" />
                  </div>
                </div>
                <Sk className="h-4 w-full" />
                <Sk className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

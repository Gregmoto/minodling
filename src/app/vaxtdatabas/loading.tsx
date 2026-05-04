function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}
export default function VaxtdatabaseLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-10">
          <Sk className="h-4 w-32 mb-8" />
          <div className="flex items-center gap-3 mb-8">
            <Sk className="h-10 w-10 rounded-xl" />
            <Sk className="h-8 w-48" />
          </div>
          {/* Kategorifilter */}
          <div className="flex gap-2 mb-8">
            {[...Array(5)].map((_, i) => <Sk key={i} className="h-8 w-24 rounded-lg" />)}
          </div>
          {/* Sökfält */}
          <Sk className="h-11 w-full max-w-sm mb-8 rounded-xl" />
          {/* Kort */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <Sk className="h-40 w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Sk className="h-5 w-3/4" />
                  <Sk className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

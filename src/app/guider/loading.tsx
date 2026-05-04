function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}
export default function GuiderLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-10">
          <Sk className="h-4 w-24 mb-8" />
          <div className="flex items-center gap-3 mb-8">
            <Sk className="h-10 w-10 rounded-xl" />
            <Sk className="h-8 w-40" />
          </div>
          <div className="flex gap-2 mb-8">
            {[...Array(4)].map((_, i) => <Sk key={i} className="h-8 w-24 rounded-lg" />)}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <Sk className="h-44 w-full rounded-none" />
                <div className="p-5 space-y-2">
                  <Sk className="h-4 w-1/3" />
                  <Sk className="h-5 w-full" />
                  <Sk className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

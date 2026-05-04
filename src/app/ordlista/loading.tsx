function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}
export default function OrdlistaLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-10">
          <Sk className="h-4 w-28 mb-8" />
          <div className="flex items-center gap-3 mb-6">
            <Sk className="h-10 w-10 rounded-xl" />
            <Sk className="h-8 w-36" />
          </div>
          <Sk className="h-11 w-full max-w-sm mb-8 rounded-xl" />
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <Sk className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Sk className="h-5 w-32" />
                  <Sk className="h-4 w-full max-w-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

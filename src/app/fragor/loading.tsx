function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}
export default function FragorLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8">
          <div className="flex items-center justify-between mb-6">
            <Sk className="h-8 w-40" />
            <Sk className="h-9 w-36 rounded-xl" />
          </div>
          {/* Kategoritabbar */}
          <div className="flex gap-2 mb-6">
            {[...Array(4)].map((_, i) => <Sk key={i} className="h-9 w-24 rounded-lg" />)}
          </div>
          {/* Frågor */}
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                <Sk className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Sk className="h-5 w-2/3" />
                  <Sk className="h-4 w-full" />
                  <div className="flex gap-3">
                    <Sk className="h-3 w-20" />
                    <Sk className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}
export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8">
          <Sk className="h-8 w-48 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Vänster kolumn */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <Sk className="h-5 w-40" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Sk className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Sk className="h-4 w-3/4" />
                      <Sk className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <Sk className="h-5 w-32" />
                {[...Array(3)].map((_, i) => <Sk key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            </div>
            {/* Höger kolumn */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <Sk className="h-5 w-28" />
                {[...Array(5)].map((_, i) => <Sk key={i} className="h-8 w-full rounded-lg" />)}
              </div>
              <div className="bg-green-50 rounded-2xl border border-green-100 p-5 space-y-2">
                <Sk className="h-4 w-36 bg-green-100" />
                {[...Array(3)].map((_, i) => <Sk key={i} className="h-10 w-full rounded-xl bg-green-100" />)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

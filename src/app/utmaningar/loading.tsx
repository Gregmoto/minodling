function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}
export default function UtmaningarLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8">
          <Sk className="h-8 w-44 mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <Sk className="h-6 w-6 rounded-lg" />
                <Sk className="h-5 w-2/3" />
                <Sk className="h-4 w-full" />
                <Sk className="h-4 w-3/4" />
                <Sk className="h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

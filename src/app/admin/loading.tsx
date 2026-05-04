function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className ?? ""}`} />;
}

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="h-16 bg-white border-b border-gray-200" />
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-56 min-h-screen bg-white border-r border-gray-100 p-4 space-y-2">
          {[...Array(10)].map((_, i) => <Sk key={i} className="h-8 w-full" />)}
        </div>
        {/* Innehåll */}
        <main className="flex-1 p-6 space-y-6">
          <Sk className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Sk key={i} className="h-24 w-full rounded-xl" />)}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <Sk className="h-12 w-full rounded-none" />
            {[...Array(6)].map((_, i) => <Sk key={i} className="h-14 w-full rounded-none border-t border-gray-50" />)}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className ?? ""}`} />;
}

/** Generisk skeleton för admin-listsidor (vaxter, guider, inlägg etc.) */
export function AdminListLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Sk className="h-8 w-40" />
        <Sk className="h-9 w-32 rounded-xl" />
      </div>
      {/* Sökfält */}
      <Sk className="h-10 w-full max-w-sm rounded-xl" />
      {/* Tabell */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Sk className="h-12 w-full rounded-none" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-t border-gray-50">
            <Sk className="h-10 w-10 rounded-lg shrink-0" />
            <Sk className="h-4 flex-1" />
            <Sk className="h-4 w-24 shrink-0" />
            <Sk className="h-6 w-16 rounded-full shrink-0" />
            <Sk className="h-8 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

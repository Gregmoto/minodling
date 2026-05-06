export default function KategoriLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-50 animate-pulse">
      <div className="h-16 bg-white border-b border-gray-100" />
      <div className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-48 bg-sage-200 rounded mb-4" />
          <div className="h-9 w-64 bg-sage-200 rounded-xl mb-2" />
          <div className="h-4 w-32 bg-sage-100 rounded" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-sage-100 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

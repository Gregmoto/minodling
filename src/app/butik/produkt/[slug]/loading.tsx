export default function ProduktLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-50 animate-pulse">
      <div className="h-16 bg-white border-b border-gray-100" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="h-4 w-64 bg-sage-200 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-sage-100 rounded-2xl" />
          <div className="space-y-5">
            <div className="h-5 w-24 bg-sage-100 rounded-full" />
            <div className="h-9 w-72 bg-sage-200 rounded-xl" />
            <div className="h-4 w-full bg-sage-100 rounded" />
            <div className="h-10 w-32 bg-sage-200 rounded-xl" />
            <div className="h-6 w-20 bg-green-100 rounded-full" />
            <div className="h-11 w-44 bg-green-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ButikLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-50 animate-pulse">
      <div className="h-16 bg-white border-b border-gray-100" />
      <div className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-32 bg-sage-200 rounded-full mb-4" />
          <div className="h-10 w-96 bg-sage-200 rounded-xl mb-3" />
          <div className="h-5 w-80 bg-sage-100 rounded-lg" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="h-7 w-40 bg-sage-200 rounded-lg mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-sage-100 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

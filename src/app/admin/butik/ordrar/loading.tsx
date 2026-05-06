export default function OrdrarLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-28 bg-gray-200 rounded-lg" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="h-80 bg-gray-100 rounded-2xl" />
    </div>
  );
}

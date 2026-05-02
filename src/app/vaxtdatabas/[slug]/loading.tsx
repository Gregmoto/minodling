// Visas direkt när användaren klickar på en växt – medan sidan renderas server-side

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}

export default function PlantDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar-platshållare */}
      <div className="h-16 border-b border-gray-100 bg-white" />

      <main className="flex-1 bg-cream-50">
        {/* Hero-skeleton */}
        <div className="h-64 sm:h-80 bg-gray-100 animate-pulse" />

        <div className="container-main py-8">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">

            {/* Sidebar – höger */}
            <div className="space-y-4 lg:col-start-3 lg:row-start-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="bg-green-50 rounded-2xl border border-green-100 p-5 space-y-3">
                <Skeleton className="h-4 w-24 bg-green-100" />
                <Skeleton className="h-4 w-full bg-green-100" />
                <Skeleton className="h-4 w-3/4 bg-green-100" />
                <Skeleton className="h-4 w-full bg-green-100" />
              </div>
            </div>

            {/* Huvudinnehåll – vänster */}
            <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 space-y-5">

              {/* Om växten */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Kalender */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>

              {/* Tillväxtperiod */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <Skeleton className="h-6 w-36" />
                <div className="flex gap-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 flex-1" />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

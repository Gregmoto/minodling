import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-4 text-center">
      {/* Animated plant */}
      <div className="relative mb-8 select-none">
        <div className="text-[120px] leading-none animate-bounce">🌱</div>
        <div
          className="absolute -top-4 -right-6 text-5xl animate-spin"
          style={{ animationDuration: "3s" }}
        >
          🐛
        </div>
      </div>

      {/* 404 */}
      <div className="relative mb-4">
        <span
          className="text-[160px] font-bold leading-none select-none"
          style={{
            background: "linear-gradient(135deg, #4A7C59 0%, #7fb069 50%, #c5e8b0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-serif">
        Oj! Den här sidan har nog inte grott än.
      </h1>
      <p className="text-gray-500 max-w-md mb-2">
        Sidan du letar efter verkar ha vandrat iväg med en mullvad, blivit
        uppäten av sniglar, eller så planterade vi den aldrig riktigt.
      </p>
      <p className="text-gray-400 text-sm mb-10">
        Felkod: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">404 · Sida saknas</code>
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white font-medium rounded-xl hover:bg-sage-700 transition-colors shadow-sm"
        >
          🏡 Till startsidan
        </Link>
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          💬 Till forumet
        </Link>
        <Link
          href="/odlingstips"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          🌿 Odlingstips
        </Link>
      </div>

      {/* Fun garden row */}
      <div className="text-3xl tracking-widest opacity-30 select-none">
        🌻 🥕 🍅 🥦 🌽 🫑 🥒 🍓 🧅 🌿
      </div>

      {/* Footer hint */}
      <p className="mt-10 text-xs text-gray-300">
        minodling.se · Om du tror det här är ett fel, kontakta oss.
      </p>
    </div>
  );
}

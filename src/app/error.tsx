"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Något gick fel</h1>
        <p className="text-sm text-gray-600 mb-6">
          Ett oväntat fel uppstod. Försök igen – går det inte, ladda om sidan eller
          gå tillbaka till startsidan.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6">Felkod: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            Försök igen
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}

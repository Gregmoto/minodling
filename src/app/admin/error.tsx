"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-lg w-full">
        <h2 className="text-lg font-bold text-red-700 mb-2">Admin – fel uppstod</h2>
        <p className="text-sm text-gray-600 mb-4">
          {error.message || "Okänt fel"}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
        )}
        <pre className="text-xs bg-gray-50 rounded-lg p-4 overflow-auto text-red-600 mb-4 max-h-48">
          {error.stack}
        </pre>
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Försök igen
        </button>
      </div>
    </div>
  );
}

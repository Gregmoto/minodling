"use client";

import { useState, useTransition } from "react";
import { Lightbulb, Send, Loader2 } from "lucide-react";
import { addPlantTip } from "@/app/vaxtdatabas/actions";

interface PlantTipFormProps {
  plantId: string;
}

export function PlantTipForm({ plantId }: PlantTipFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await addPlantTip(plantId, content);
        setContent("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Dela ett praktiskt tips om odlingen..."
          disabled={isPending}
          rows={3}
          maxLength={1000}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white resize-none disabled:opacity-50"
        />
        <span className="absolute bottom-2 right-3 text-xs text-gray-300">
          {content.length}/1000
        </span>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && (
        <p className="text-xs text-green-600 font-medium">✓ Tack! Ditt tips har lagts till.</p>
      )}

      <button
        type="submit"
        disabled={isPending || content.trim().length < 5}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Lightbulb className="h-4 w-4" />
        )}
        {isPending ? "Sparar..." : "Dela tips"}
      </button>
    </form>
  );
}

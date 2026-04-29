"use client";

import { useState, useTransition } from "react";
import { Loader2, X, Camera } from "lucide-react";
import { submitEntry } from "@/app/utmaningar/actions";
import { ImageInput } from "@/components/ui/ImageInput";

export function EntryUploadForm({ challengeId, slug }: { challengeId: string; slug: string }) {
  const [imageUrl,     setImageUrl]     = useState<string | null>(null);
  const [open,         setOpen]         = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    start]           = useTransition();

  function handleSubmit(formData: FormData) {
    if (!imageUrl) { setError("Bild krävs"); return; }
    formData.set("imageUrl", imageUrl);
    setError(null);
    start(async () => {
      try {
        await submitEntry(challengeId, formData);
        setImageUrl(null); setOpen(false);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    });
  }

  if (!open && !imageUrl) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
        <Camera className="h-4 w-4" /> Skicka in bidrag
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 max-w-md">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Skicka in ditt bidrag</h3>
        <button onClick={() => { setOpen(false); setImageUrl(null); }} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <ImageInput
        value={imageUrl}
        onChange={setImageUrl}
        name="imageUrl"
        bucket="challenge-images"
        folder="entries"
      />

      <form action={handleSubmit} className="space-y-3">
        <textarea name="caption" rows={2} maxLength={300}
          placeholder="Beskriv ditt bidrag (valfritt)..."
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none" />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button type="submit" disabled={isPending || !imageUrl}
          className="w-full py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Laddar upp...</> : "Publicera bidrag"}
        </button>
      </form>
    </div>
  );
}

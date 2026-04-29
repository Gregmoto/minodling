"use client";

import { useState, useTransition, useRef } from "react";
import { Loader2, Upload, X, Camera } from "lucide-react";
import { submitEntry } from "@/app/utmaningar/actions";
import { uploadPlantImage } from "@/app/vaxtdatabas/actions";

export function EntryUploadForm({ challengeId, slug }: { challengeId: string; slug: string }) {
  const [imageUrl,     setImageUrl]     = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError,   setImageError]   = useState<string | null>(null);
  const [open,         setOpen]         = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    start]           = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setImageError(null); setImageLoading(true);
    const fd = new FormData(); fd.append("image", file);
    const r = await uploadPlantImage(fd);
    setImageLoading(false);
    if (r.error) setImageError(r.error);
    else if (r.url) { setImageUrl(r.url); setOpen(true); }
  }

  function handleSubmit(formData: FormData) {
    if (!imageUrl) { setError("Bild krävs"); return; }
    formData.set("imageUrl", imageUrl);
    setError(null);
    start(async () => {
      try {
        await submitEntry(challengeId, formData);
        setImageUrl(null); setOpen(false);
        if (fileRef.current) fileRef.current.value = "";
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    });
  }

  if (!open && !imageUrl) {
    return (
      <button onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 px-5 py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
        <Camera className="h-4 w-4" /> Skicka in bidrag
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
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

      {imageUrl ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="w-full max-h-56 object-cover rounded-xl" />
          <button type="button" onClick={() => setImageUrl(null)}
            className="absolute top-2 right-2 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-red-50">
            <X className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={imageLoading}
          className="flex flex-col items-center gap-2 w-full py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-sage-400 hover:text-sage-600 transition-colors">
          {imageLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Upload className="h-6 w-6" /><span className="text-sm">Välj bild</span></>}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      {imageError && <p className="text-xs text-red-600">{imageError}</p>}

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

"use client";

import { useState, useTransition, useRef } from "react";
import { Lightbulb, Send, Loader2, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { addPlantTip, uploadPlantImage } from "@/app/vaxtdatabas/actions";

interface PlantTipFormProps {
  plantId: string;
}

export function PlantTipForm({ plantId }: PlantTipFormProps) {
  const [content,    setContent]    = useState("");
  const [imageUrl,   setImageUrl]   = useState<string | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);
  const [isPending,  startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const res = await uploadPlantImage(fd);
    setUploading(false);
    if (res.error) { setUploadErr(res.error); return; }
    if (res.url)   setImageUrl(res.url);
    // reset file input so same file can be re-selected
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await addPlantTip(plantId, content, imageUrl);
        setContent("");
        setImageUrl(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Textfält */}
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

      {/* Bildförhandsgranskning */}
      {imageUrl && (
        <div className="relative w-fit">
          <Image
            src={imageUrl}
            alt="Bifogad bild"
            width={200}
            height={150}
            className="rounded-xl object-cover max-h-40 w-auto border border-gray-200"
          />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-900 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bildfelsmeddelande */}
      {uploadErr && <p className="text-xs text-red-600">{uploadErr}</p>}

      {/* Knappar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Lägg till bild */}
        <label className={`
          flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors
          ${uploading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
        `}>
          {uploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Laddar upp..." : "Lägg till bild"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading || isPending}
            onChange={handleImageChange}
          />
        </label>

        {/* Skicka */}
        <button
          type="submit"
          disabled={isPending || uploading || content.trim().length < 5}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="h-4 w-4" />
          )}
          {isPending ? "Sparar..." : "Dela tips"}
        </button>
      </div>

      {error   && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600 font-medium">✓ Tack! Ditt tips har lagts till.</p>}
    </form>
  );
}

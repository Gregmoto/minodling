"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { Lightbulb, Loader2, ImagePlus, X, Upload } from "lucide-react";
import { addPlantTip, uploadPlantImage } from "@/app/vaxtdatabas/actions";

interface PlantTipFormProps {
  plantId: string;
}

export function PlantTipForm({ plantId }: PlantTipFormProps) {
  const [content,   setContent]   = useState("");
  const [imageUrl,  setImageUrl]  = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [dragging,  setDragging]  = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Bilduppladdning ──────────────────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setUploadErr("Endast bilder är tillåtna"); return; }
    if (file.size > 10 * 1024 * 1024)   { setUploadErr("Max 10 MB"); return; }
    setUploadErr(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const res = await uploadPlantImage(fd);
    setUploading(false);
    if (res.error) { setUploadErr(res.error); return; }
    if (res.url)   setImageUrl(res.url);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  // ── Filväljare ───────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  // ── Drag & drop ──────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  // ── Klistra in från urklipp ──────────────────────────────────────
  function handlePaste(e: React.ClipboardEvent) {
    const file = Array.from(e.clipboardData.items)
      .find((item) => item.type.startsWith("image/"))
      ?.getAsFile();
    if (file) uploadFile(file);
  }

  // ── Skicka ───────────────────────────────────────────────────────
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

      {/* Textfält med paste-support */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          placeholder="Dela ett praktiskt tips om odlingen... (klistra in bild med Ctrl+V)"
          disabled={isPending}
          rows={3}
          maxLength={1000}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white resize-none disabled:opacity-50"
        />
        <span className="absolute bottom-2 right-3 text-xs text-gray-300">
          {content.length}/1000
        </span>
      </div>

      {/* Drop-zon – visas bara om ingen bild är vald */}
      {!imageUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-2
            border-2 border-dashed rounded-xl px-4 py-5 cursor-pointer
            transition-colors select-none
            ${dragging
              ? "border-green-400 bg-green-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
            ${uploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
              <p className="text-xs text-gray-500">Laddar upp...</p>
            </>
          ) : (
            <>
              <Upload className={`h-6 w-6 ${dragging ? "text-green-500" : "text-gray-300"}`} />
              <p className="text-xs text-gray-400 text-center">
                <span className="font-medium text-gray-600">Klicka</span> eller dra och släpp en bild hit
                <span className="block text-gray-300 mt-0.5">Du kan också klistra in med Ctrl+V i textrutan</span>
              </p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading || isPending}
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Förhandsgranskning */}
      {imageUrl && (
        <div className="relative w-fit">
          <img
            src={imageUrl}
            alt="Bifogad bild"
            className="rounded-xl max-h-48 w-auto object-cover border border-gray-200"
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

      {uploadErr && <p className="text-xs text-red-600">{uploadErr}</p>}

      {/* Skicka-knapp */}
      <button
        type="submit"
        disabled={isPending || uploading || content.trim().length < 5}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
        {isPending ? "Sparar..." : "Dela tips"}
      </button>

      {error   && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600 font-medium">✓ Tack! Ditt tips har lagts till.</p>}
    </form>
  );
}

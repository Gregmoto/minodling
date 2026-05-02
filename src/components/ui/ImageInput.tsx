"use client";

import { useRef, useState, useCallback } from "react";
import { Link as LinkIcon, X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface ImageInputProps {
  value?:     string | null;
  onChange?:  (url: string | null) => void;
  name?:      string;
  bucket?:    string;
  folder?:    string;
  label?:     string;
  maxMb?:     number;
  urlOnly?:   boolean;
  className?: string;
}

export function ImageInput({
  value,
  onChange,
  name      = "imageUrl",
  bucket    = "uploads",
  folder    = "images",
  label     = "Lägg till bild",
  maxMb     = 10,
  urlOnly   = false,
  className,
}: ImageInputProps) {
  const [internalUrl, setInternalUrl] = useState<string | null>(value ?? null);
  const [urlInput,    setUrlInput]    = useState("");
  const [showUrl,     setShowUrl]     = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentUrl = value !== undefined ? (value ?? null) : internalUrl;

  function update(url: string | null) {
    if (value === undefined) setInternalUrl(url);
    onChange?.(url);
  }

  function clear() {
    update(null);
    setUrlInput("");
    setError(null);
    setShowUrl(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ── Uppladdning ──────────────────────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Endast bilder är tillåtna"); return; }
    if (file.size > maxMb * 1024 * 1024) { setError(`Max ${maxMb} MB (filen är ${(file.size / 1024 / 1024).toFixed(1)} MB)`); return; }

    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext  = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      update(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uppladdning misslyckades");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [bucket, folder, maxMb]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag & drop ──────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  // ── Klistra in ───────────────────────────────────────────────────
  function handlePaste(e: React.ClipboardEvent) {
    const file = Array.from(e.clipboardData.items)
      .find((item) => item.type.startsWith("image/"))
      ?.getAsFile();
    if (file) uploadFile(file);
  }

  // ── URL ──────────────────────────────────────────────────────────
  function applyUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    update(trimmed);
    setError(null);
    setShowUrl(false);
  }

  // ── Förhandsvisning ──────────────────────────────────────────────
  if (currentUrl) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="relative inline-block group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="Vald bild"
            className="max-h-48 w-auto rounded-xl border border-gray-200 object-cover shadow-sm"
            onError={() => setError("Bilden kunde inte laddas")}
          />
          <button
            type="button"
            onClick={clear}
            className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors"
            aria-label="Ta bort bild"
          >
            <X className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
        <input type="hidden" name={name} value={currentUrl} />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  // ── Tom state: drop-zon ──────────────────────────────────────────
  return (
    <div className={cn("space-y-2", className)} onPaste={handlePaste}>

      {/* Drop-zon */}
      {!urlOnly && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 w-full px-4 py-6",
            "border-2 border-dashed rounded-xl cursor-pointer select-none transition-colors",
            dragging
              ? "border-green-400 bg-green-50"
              : "border-gray-200 hover:border-green-300 hover:bg-gray-50",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
              <p className="text-xs text-gray-500">Laddar upp...</p>
            </>
          ) : (
            <>
              <Upload className={cn("h-6 w-6", dragging ? "text-green-500" : "text-gray-300")} />
              <p className="text-xs text-center text-gray-400">
                <span className="font-medium text-gray-600">Klicka</span> eller dra och släpp en bild hit
                <span className="block text-gray-300 mt-0.5">Klistra in med Ctrl+V fungerar också · max {maxMb} MB</span>
              </p>
            </>
          )}
        </div>
      )}

      {/* URL-alternativ */}
      {!showUrl ? (
        <button
          type="button"
          onClick={() => setShowUrl(true)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LinkIcon className="h-3 w-3" /> Klistra in bild-URL istället
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            autoFocus
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
            placeholder="https://example.com/bild.jpg"
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={!urlInput.trim()}
            className="px-3 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => { setShowUrl(false); setUrlInput(""); }}
            className="px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Avbryt
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

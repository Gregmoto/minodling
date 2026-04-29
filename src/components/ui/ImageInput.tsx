"use client";

import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ── Typer ─────────────────────────────────────────────────────────

export interface ImageInputProps {
  /** Nuvarande bild-URL (kontrollerat läge) */
  value?:       string | null;
  /** Callback när URL ändras (klistra in eller uppladdad) */
  onChange?:    (url: string | null) => void;
  /** name-attribut för hidden input (används i FormData) */
  name?:        string;
  /** Supabase storage bucket, t.ex. "plant-images" */
  bucket?:      string;
  /** Undermapp i bucket, t.ex. "diagnoses" */
  folder?:      string;
  /** Etikett som visas i drop-zonen */
  label?:       string;
  /** Max filstorlek i MB */
  maxMb?:       number;
  /** Visa inte bläddra-knappen */
  urlOnly?:     boolean;
  className?:   string;
}

// ── Komponent ─────────────────────────────────────────────────────

export function ImageInput({
  value,
  onChange,
  name        = "imageUrl",
  bucket      = "uploads",
  folder      = "images",
  label       = "Lägg till bild",
  maxMb       = 10,
  urlOnly     = false,
  className,
}: ImageInputProps) {
  const [internalUrl, setInternalUrl] = useState<string | null>(value ?? null);
  const [urlInput,    setUrlInput]    = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [tab,         setTab]         = useState<"url" | "file">("url");
  const fileRef = useRef<HTMLInputElement>(null);

  // Kontrollerat eller okontrollerat
  const currentUrl = value !== undefined ? (value ?? null) : internalUrl;

  function update(url: string | null) {
    if (value === undefined) setInternalUrl(url);
    onChange?.(url);
  }

  function clear() {
    update(null);
    setUrlInput("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function applyUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    update(trimmed);
    setError(null);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxMb * 1024 * 1024) {
      setError(`Max ${maxMb} MB tillåtet (filen är ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase   = createClient();
      const ext        = file.name.split(".").pop();
      const path       = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      update(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Uppladdning misslyckades");
    } finally {
      setUploading(false);
    }
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
            onError={() => setError("Bilden kunde inte laddas – kontrollera URL:en")}
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
        {/* Hidden input för FormData */}
        <input type="hidden" name={name} value={currentUrl} />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  // ── Tom state ────────────────────────────────────────────────────
  return (
    <div className={cn("space-y-3", className)}>

      {/* Tab-växlare (döljs om urlOnly) */}
      {!urlOnly && (
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-medium w-fit">
          <button
            type="button"
            onClick={() => setTab("url")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 transition-colors",
              tab === "url"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50",
            )}
          >
            <LinkIcon className="h-3 w-3" />
            Klistra in URL
          </button>
          <button
            type="button"
            onClick={() => setTab("file")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 transition-colors",
              tab === "file"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50",
            )}
          >
            <Upload className="h-3 w-3" />
            Ladda upp
          </button>
        </div>
      )}

      {/* URL-input */}
      {(tab === "url" || urlOnly) && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
              placeholder="https://example.com/bild.jpg"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={applyUrl}
            disabled={!urlInput.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            Använd
          </button>
        </div>
      )}

      {/* Fil-upload */}
      {tab === "file" && !urlOnly && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Laddar upp...</>
          ) : (
            <><ImageIcon className="h-4 w-4" />{label} (max {maxMb} MB)</>
          )}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

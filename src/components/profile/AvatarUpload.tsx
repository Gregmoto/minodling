"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { uploadAvatar } from "@/app/profil/actions";
import { Camera, Loader2 } from "lucide-react";

interface AvatarUploadProps {
  currentUrl?: string | null;
  username: string;
}

export function AvatarUpload({ currentUrl, username }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Filen är för stor (max 5 MB)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Endast bilder är tillåtna");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("avatar", file);

    startTransition(async () => {
      const result = await uploadAvatar(fd);
      if (result.error) {
        setError(result.error);
        setPreview(null);
      }
    });
  }

  const src = preview ?? currentUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar
          src={src}
          fallback={username}
          size="xl"
          className="h-24 w-24 ring-4 ring-white shadow-md"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
          aria-label="Byt profilbild"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="text-xs text-green-700 hover:text-green-800 font-medium transition-colors disabled:opacity-50"
      >
        {isPending ? "Laddar upp..." : "Byt profilbild"}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">Max 5 MB · JPG, PNG, WebP</p>
    </div>
  );
}

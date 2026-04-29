"use client";

import { useState, useTransition, useRef } from "react";
import { Image as ImageIcon, X, Loader2, Upload } from "lucide-react";
import { createPost, uploadPostImage } from "@/app/forum/actions";
import { Avatar } from "@/components/ui/Avatar";

interface PostType {
  value: string;
  label: string;
}

interface NewPostFormProps {
  categories: string[];
  postTypes: PostType[];
  currentUsername: string;
  currentUserAvatar?: string | null;
}

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function NewPostForm({
  categories,
  postTypes,
  currentUsername,
  currentUserAvatar,
}: NewPostFormProps) {
  const [selectedType, setSelectedType] = useState("general");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Max 10 MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setImageError("Endast bilder är tillåtna");
      return;
    }

    setImageError(null);
    setImageUploading(true);

    const fd = new FormData();
    fd.append("image", file);
    const result = await uploadPostImage(fd);

    setImageUploading(false);
    if (result.error) {
      setImageError(result.error);
    } else if (result.url) {
      setImageUrl(result.url);
    }
  }

  function handleSubmit(formData: FormData) {
    if (imageUrl) formData.set("imageUrl", imageUrl);
    formData.set("postType", selectedType);

    startTransition(async () => {
      try {
        await createPost(formData);
      } catch (err) {
        // redirect() throws, but real errors:
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Inläggstyp */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Typ av inlägg</label>
        <div className="flex flex-wrap gap-2">
          {postTypes.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => setSelectedType(pt.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                selectedType === pt.value
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="postType" value={selectedType} />
      </div>

      {/* Titel */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Rubrik <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={200}
          placeholder="Vad handlar ditt inlägg om?"
          className={inputClass}
        />
      </div>

      {/* Innehåll */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <Avatar
            src={currentUserAvatar}
            fallback={currentUsername}
            size="sm"
            className="shrink-0"
          />
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Innehåll <span className="text-red-400">*</span>
          </label>
        </div>
        <textarea
          id="content"
          name="content"
          required
          minLength={10}
          maxLength={10000}
          rows={6}
          placeholder="Dela din erfarenhet, fråga eller tips..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Kategori */}
      <div className="space-y-1.5">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Kategori
        </label>
        <select id="category" name="category" className={inputClass}>
          <option value="">Välj kategori (valfritt)</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Bild */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Bild (valfritt)</label>

        {imageUrl ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uppladdad bild"
              className="max-h-48 rounded-xl border border-gray-200 object-cover"
            />
            <button
              type="button"
              onClick={() => { setImageUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-50 w-full justify-center"
          >
            {imageUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Laddar upp...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Ladda upp bild (max 10 MB)
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        {imageError && <p className="text-xs text-red-600">{imageError}</p>}
        {imageUrl && <input type="hidden" name="imageUrl" value={imageUrl} />}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || imageUploading}
          className="flex-1 py-2.5 px-4 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publicerar...
            </>
          ) : (
            "Publicera inlägg"
          )}
        </button>
      </div>
    </form>
  );
}

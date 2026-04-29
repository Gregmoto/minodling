"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createPost } from "@/app/forum/actions";
import { Avatar } from "@/components/ui/Avatar";
import { ImageInput } from "@/components/ui/ImageInput";

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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="uploads"
          folder="forum"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
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

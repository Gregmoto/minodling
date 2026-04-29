"use client";

import { useState, useTransition, useRef } from "react";
import { Send, Loader2, Upload, X } from "lucide-react";
import { addAnswer } from "@/app/fragor/actions";
import { uploadQuestionImage } from "@/app/fragor/actions";
import { Avatar } from "@/components/ui/Avatar";

interface Props {
  questionId:         string;
  currentUsername:    string;
  currentUserAvatar?: string | null;
}

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function AnswerForm({ questionId, currentUsername, currentUserAvatar }: Props) {
  const [content,        setContent]        = useState("");
  const [imageUrl,       setImageUrl]       = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError,     setImageError]     = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [success,        setSuccess]        = useState(false);
  const [isPending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setImageUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const result = await uploadQuestionImage(fd);
    setImageUploading(false);
    if (result.error) setImageError(result.error);
    else if (result.url) setImageUrl(result.url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        await addAnswer(questionId, content, imageUrl ?? undefined);
        setContent("");
        setImageUrl(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar src={currentUserAvatar} fallback={currentUsername} size="sm" className="shrink-0 mt-1" />
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv ditt svar... (Cmd+Enter för att skicka)"
            disabled={isPending}
            rows={5}
            maxLength={5000}
            className={`${inputClass} resize-none`}
          />

          {/* Bilduppladdning */}
          {imageUrl ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Uppladdad bild" className="max-h-40 rounded-xl border border-gray-200 object-cover" />
              <button
                type="button"
                onClick={() => { setImageUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={imageUploading}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-50"
            >
              {imageUploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Laddar upp...</> : <><Upload className="h-3.5 w-3.5" /> Bifoga bild</>}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {imageError && <p className="text-xs text-red-600">{imageError}</p>}

          {error   && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-green-600 font-medium">✓ Ditt svar har publicerats!</p>}

          <button
            type="submit"
            disabled={isPending || content.trim().length < 10}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isPending ? "Publicerar..." : "Publicera svar"}
          </button>
        </div>
      </div>
    </form>
  );
}

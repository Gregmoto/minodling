"use client";

import { useState, useEffect, useRef } from "react";

type ContentType = "plant" | "guide" | "article" | "glossary";

export function useDuplicateCheck(type: ContentType, value: string, skipId?: string) {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 2) {
      setIsDuplicate(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ type, value: value.trim() });
        if (skipId) params.set("skip", skipId);
        const res = await fetch(`/api/admin/check-duplicate?${params}`);
        const data = await res.json();
        setIsDuplicate(data.exists);
      } catch {
        setIsDuplicate(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [type, value, skipId]);

  return isDuplicate;
}

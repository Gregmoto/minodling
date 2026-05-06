"use client";

import Link from "next/link";

interface QuickLink {
  id: string;
  title: string;
  url: string;
  emoji: string | null;
}

interface Props {
  links: QuickLink[];
}

export function QuickLinks({ links }: Props) {
  if (links.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.url}
          className="flex-none inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-green-50 hover:border-green-300 hover:text-green-800 transition-colors whitespace-nowrap"
        >
          {link.emoji && <span aria-hidden="true">{link.emoji}</span>}
          {link.title}
        </Link>
      ))}
    </div>
  );
}

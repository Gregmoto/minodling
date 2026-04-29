"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Link, Minus, Quote, Eye, Code2, ExternalLink,
} from "lucide-react";

interface Props {
  name:         string;
  defaultValue?: string;
  placeholder?: string;
  rows?:        number;
}

type ToolAction = {
  label:   string;
  icon:    React.ElementType;
  title:   string;
  wrap?:   [string, string]; // wraps selection
  block?:  string;           // prefixes line
  insert?: string;           // inserts at cursor
};

const TOOLS: ToolAction[] = [
  { label: "b",   icon: Bold,         title: "Fet",      wrap: ["<strong>", "</strong>"] },
  { label: "i",   icon: Italic,       title: "Kursiv",   wrap: ["<em>", "</em>"] },
  { label: "h2",  icon: Heading2,     title: "Rubrik 2", wrap: ["<h2>", "</h2>"] },
  { label: "h3",  icon: Heading3,     title: "Rubrik 3", wrap: ["<h3>", "</h3>"] },
  { label: "ul",  icon: List,         title: "Punktlista",  wrap: ["<ul>\n  <li>", "</li>\n</ul>"] },
  { label: "ol",  icon: ListOrdered,  title: "Numrerad lista", wrap: ["<ol>\n  <li>", "</li>\n</ol>"] },
  { label: "bq",  icon: Quote,        title: "Citat",    wrap: ["<blockquote>", "</blockquote>"] },
  { label: "code",icon: Code2,        title: "Kod",      wrap: ["<code>", "</code>"] },
  { label: "hr",  icon: Minus,        title: "Avdelare", insert: "\n<hr />\n" },
];

const LINK_SHORTCUTS = [
  { label: "Tomat",      href: "/vaxtdatabas/tomat" },
  { label: "Gurka",      href: "/vaxtdatabas/gurka" },
  { label: "Chili",      href: "/vaxtdatabas/chili" },
  { label: "Odlingszon", href: "/ordlista/odlingszon" },
  { label: "Kompost",    href: "/kunskapsbank/kompost" },
  { label: "Sådatum",    href: "/odlingskalender" },
];

export function ContentEditor({ name, defaultValue = "", placeholder, rows = 24 }: Props) {
  const [value,   setValue]   = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const exec = useCallback((tool: ToolAction) => {
    const ta = textRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = value.slice(start, end);

    let newVal: string;
    let newCursor: number;

    if (tool.insert) {
      newVal    = value.slice(0, start) + tool.insert + value.slice(end);
      newCursor = start + tool.insert.length;
    } else if (tool.wrap) {
      const [open, close] = tool.wrap;
      const inner = sel || "text";
      const replacement = open + inner + close;
      newVal    = value.slice(0, start) + replacement + value.slice(end);
      newCursor = start + open.length + inner.length + close.length;
    } else {
      return;
    }

    setValue(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newCursor, newCursor);
    });
  }, [value]);

  function insertLink() {
    const ta   = textRef.current;
    if (!ta) return;
    const href  = prompt("URL:");
    if (!href) return;
    const label = value.slice(ta.selectionStart, ta.selectionEnd) || prompt("Länktext:") || href;
    const html  = `<a href="${href}">${label}</a>`;
    const start = ta.selectionStart;
    const newVal = value.slice(0, start) + html + value.slice(ta.selectionEnd);
    setValue(newVal);
  }

  function insertShortcutLink(href: string, label: string) {
    const ta = textRef.current;
    if (!ta) return;
    const pos    = ta.selectionStart;
    const html   = `<a href="${href}">${label}</a>`;
    setValue(value.slice(0, pos) + html + value.slice(pos));
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-xl border-b-0">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.label}
              type="button"
              title={tool.title}
              onClick={() => exec(tool)}
              className="flex items-center justify-center h-7 w-7 rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}

        {/* Länk */}
        <button
          type="button"
          title="Länk"
          onClick={insertLink}
          className="flex items-center justify-center h-7 w-7 rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-colors"
        >
          <Link className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Snabblänkar */}
        <span className="text-xs text-gray-400 mr-1">Länka:</span>
        {LINK_SHORTCUTS.map((s) => (
          <button
            key={s.href}
            type="button"
            onClick={() => insertShortcutLink(s.href, s.label)}
            className="text-xs px-2 py-1 rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition-colors border border-green-200"
          >
            {s.label}
          </button>
        ))}

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              preview ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {preview ? "Redigera" : "Förhandsgranska"}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="prose-minodling min-h-[400px] px-4 py-3 border border-gray-200 rounded-b-xl bg-white overflow-auto"
          dangerouslySetInnerHTML={{ __html: value || "<p class='text-gray-400'>Inget innehåll än...</p>" }}
        />
      ) : (
        <textarea
          ref={textRef}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "Skriv innehåll som HTML..."}
          rows={rows}
          className="w-full text-sm font-mono border border-gray-200 rounded-b-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white resize-y"
        />
      )}

      {/* Teckenräknare */}
      <p className="text-xs text-gray-400 text-right">{value.length} tecken</p>
    </div>
  );
}

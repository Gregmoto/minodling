"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2, StickyNote, Camera, Bell, Share2,
  Loader2, X, ChevronDown, ExternalLink, Upload,
  AlertCircle, Plus, Trash2,
} from "lucide-react";
import { PROBLEM_STATUSES, STATUS_COLORS, getStatus } from "../constants";
import type { HealthCheckResult } from "@/app/api/health-check/route";
import { updateStatus, updateNotes, addFollowUp, createReminderForCheck } from "../actions";

// ── Typer ─────────────────────────────────────────────────────────

interface FollowUp {
  id:        string;
  imageUrl:  string | null;
  note:      string | null;
  createdAt: Date;
}

interface CheckDetail {
  id:             string;
  imageUrl:       string | null;
  symptoms:       string[];
  resultsJson:    unknown;
  selectedProblem: string | null;
  notes:          string | null;
  status:         string;
  createdAt:      Date;
  plant:          { name: string; slug: string } | null;
  followUps:      FollowUp[];
}

interface SymptomDef { key: string; label: string; emoji: string }

interface Props {
  check:    CheckDetail;
  symptoms: SymptomDef[];
}

// ── StatusSelector ────────────────────────────────────────────────

function StatusSelector({ checkId, currentStatus }: { checkId: string; currentStatus: string }) {
  const [open,       setOpen]       = useState(false);
  const [pending,    startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const current = getStatus(localStatus);

  function select(key: string) {
    setLocalStatus(key);
    setOpen(false);
    startTransition(() => updateStatus(checkId, key));
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        disabled={pending}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${STATUS_COLORS[localStatus]}`}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{current.emoji}</span>}
        {current.label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            {PROBLEM_STATUSES.map((s) => (
              <button
                key={s.key}
                onClick={() => select(s.key)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                  s.key === localStatus ? "font-semibold text-gray-900" : "text-gray-700"
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
                {s.key === localStatus && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 ml-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── NotesEditor ───────────────────────────────────────────────────

function NotesEditor({ checkId, initialNotes }: { checkId: string; initialNotes: string | null }) {
  const [notes,   setNotes]   = useState(initialNotes ?? "");
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updateNotes(checkId, notes);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-amber-500" />
          Anteckningar
        </h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-green-700 hover:text-green-800 font-medium"
          >
            {notes ? "Redigera" : "Lägg till"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Skriv dina anteckningar här…"
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={pending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Spara
            </button>
            <button
              onClick={() => { setNotes(initialNotes ?? ""); setEditing(false); }}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </div>
      ) : (
        <p className={`text-sm leading-relaxed ${notes ? "text-gray-700" : "text-gray-400 italic"}`}>
          {notes || "Inga anteckningar ännu."}
        </p>
      )}

      {saved && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Sparat!
        </p>
      )}
    </div>
  );
}

// ── FollowUpSection ───────────────────────────────────────────────

function FollowUpSection({ checkId, followUps }: { checkId: string; followUps: FollowUp[] }) {
  const [open,    setOpen]    = useState(false);
  const [note,    setNote]    = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error,   setError]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFile(f: File) {
    if (f.size > 10 * 1024 * 1024) { setError("Max 10 MB"); return; }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() && !preview) { setError("Lägg till en bild eller anteckning."); return; }
    setError(null);

    const form = formRef.current!;
    const fd   = new FormData(form);

    startTransition(async () => {
      await addFollowUp(fd);
      setNote("");
      setPreview(null);
      setOpen(false);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <Camera className="h-4 w-4 text-blue-500" />
          Uppföljningar
          {followUps.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
              {followUps.length}
            </span>
          )}
        </h3>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Lägg till
        </button>
      </div>

      {/* Befintliga uppföljningar */}
      {followUps.length > 0 && (
        <div className="space-y-3">
          {followUps.map((fu) => (
            <div key={fu.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              {fu.imageUrl && (
                <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <Image src={fu.imageUrl} alt="Uppföljning" fill className="object-cover" sizes="56px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {fu.note && <p className="text-sm text-gray-700">{fu.note}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(fu.createdAt).toLocaleDateString("sv-SE", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lägg-till-form */}
      {open && (
        <form ref={formRef} onSubmit={submit} className="space-y-3 pt-3 border-t border-gray-100">
          <input type="hidden" name="id" value={checkId} />

          {/* Bild */}
          {preview ? (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200">
              <Image src={preview} alt="Förhandsvisning" fill className="object-cover" />
              <button
                type="button"
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 h-7 w-7 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 h-16 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-green-300 hover:text-green-600 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Lägg till bild (valfritt)
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            name="image"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {/* Anteckning */}
          <textarea
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anteckning om uppföljningen…"
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 resize-none"
          />

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Spara uppföljning
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setPreview(null); setNote(""); setError(null); }}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}

      {followUps.length === 0 && !open && (
        <p className="text-sm text-gray-400 italic">Inga uppföljningar ännu.</p>
      )}
    </div>
  );
}

// ── ReminderForm ──────────────────────────────────────────────────

function ReminderForm({ checkId, plantName }: { checkId: string; plantName: string | null }) {
  const [open,    setOpen]    = useState(false);
  const [pending, startTransition] = useTransition();
  const [done,    setDone]    = useState(false);

  const today = new Date();
  today.setDate(today.getDate() + 7);
  const defaultDate = today.toISOString().slice(0, 10);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createReminderForCheck(fd);
      setDone(true);
      setOpen(false);
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <Bell className="h-4 w-4 text-orange-400" />
          Påminnelse
        </h3>
      </div>

      {done ? (
        <p className="text-sm text-green-600 flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          Påminnelse skapad! Visas under{" "}
          <Link href="/paminnelser" className="underline">Påminnelser</Link>.
        </p>
      ) : open ? (
        <form onSubmit={submit} className="space-y-3">
          <input type="hidden" name="healthCheckId" value={checkId} />
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Titel</label>
            <input
              name="title"
              type="text"
              defaultValue={`Följ upp ${plantName ?? "växtproblem"}`}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Datum</label>
            <input
              name="dueDate"
              type="date"
              defaultValue={defaultDate}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Anteckning</label>
            <input
              name="description"
              type="text"
              placeholder="Valfri beskrivning…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Skapa påminnelse
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50"
            >
              Avbryt
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium w-full"
        >
          <Bell className="h-4 w-4 text-orange-400" />
          Skapa påminnelse för uppföljning
        </button>
      )}
    </div>
  );
}

// ── SharePanel ────────────────────────────────────────────────────

function SharePanel({ check, symptoms }: { check: CheckDetail; symptoms: SymptomDef[] }) {
  const results      = check.resultsJson as HealthCheckResult[];
  const topProblem   = results?.[0]?.problemLabel ?? "";
  const symptomText  = check.symptoms
    .map((k) => symptoms.find((s) => s.key === k)?.label)
    .filter(Boolean)
    .join(", ");

  const prefilledDesc = [
    check.plant?.name ? `Växt: ${check.plant.name}` : "",
    symptomText ? `Symptom: ${symptomText}` : "",
    topProblem  ? `Möjlig orsak: ${topProblem}` : "",
  ].filter(Boolean).join("\n");

  const shareUrl =
    `/vaxtdiagnos/ny?` +
    (check.plant?.name ? `vaxt=${encodeURIComponent(check.plant.name)}&` : "") +
    `problem=${encodeURIComponent(topProblem)}`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
        <Share2 className="h-4 w-4 text-violet-500" />
        Dela med communityn
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">
        Fråga communityn om råd. Diagnosen förifylls som beskrivning men du kan redigera innan du publicerar.
      </p>
      <Link
        href={shareUrl}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        Skapa community-post
      </Link>
      <details className="text-xs">
        <summary className="text-gray-400 cursor-pointer hover:text-gray-600">
          Förhandsvisa förifylld text
        </summary>
        <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-600 whitespace-pre-wrap">
          {prefilledDesc || "(ingen förifylld text)"}
        </pre>
      </details>
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────

export function ProblemDetail({ check, symptoms }: Props) {
  const results    = check.resultsJson as HealthCheckResult[];
  const status     = getStatus(check.status);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid lg:grid-cols-3 gap-6">

      {/* ── Vänster: diagnos + symptom ── */}
      <div className="lg:col-span-2 space-y-4">

        {/* Status-rad */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <StatusSelector checkId={check.id} currentStatus={check.status} />
          </div>
          <p className="text-xs text-gray-400">
            {new Date(check.createdAt).toLocaleDateString("sv-SE", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        {/* Bild */}
        {check.imageUrl && (
          <div className="relative aspect-[4/3] sm:aspect-[16/7] rounded-2xl overflow-hidden border border-gray-200">
            <Image src={check.imageUrl} alt="Växtbild" fill className="object-cover" />
          </div>
        )}

        {/* Symptom */}
        {check.symptoms.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Valda symptom
            </p>
            <div className="flex flex-wrap gap-2">
              {check.symptoms.map((key) => {
                const s = symptoms.find((x) => x.key === key);
                return s ? (
                  <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium">
                    <span>{s.emoji}</span>
                    {s.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Diagnosresultat */}
        {results.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Diagnos-resultat
            </p>
            {results.map((r, i) => (
              <div key={i} className={`p-3 rounded-xl ${i === 0 ? "bg-green-50 border border-green-100" : "bg-gray-50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-semibold text-sm text-gray-800">
                    <span>{r.emoji}</span>
                    {r.problemLabel}
                  </span>
                  <span className={`text-xs font-bold ${
                    r.probability >= 60 ? "text-green-600" :
                    r.probability >= 35 ? "text-amber-600" : "text-gray-400"
                  }`}>
                    {r.probability}%
                  </span>
                </div>
                {i === 0 && (
                  <>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{r.explanation}</p>
                    <div className="mt-2 p-2.5 rounded-lg bg-green-100 border border-green-200">
                      <p className="text-xs font-semibold text-green-800">Åtgärd</p>
                      <p className="text-xs text-green-700 mt-0.5">{r.action}</p>
                    </div>
                    {r.steps.length > 0 && (
                      <ol className="mt-2 space-y-1">
                        {r.steps.map((step, j) => (
                          <li key={j} className="flex gap-2 text-xs text-gray-600">
                            <span className="shrink-0 w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center">
                              {j + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Höger: actions ── */}
      <div className="space-y-4">

        {/* Växt-länk */}
        {check.plant && (
          <Link
            href={`/vaxtdatabas/${check.plant.slug}`}
            className="flex items-center justify-between p-4 rounded-2xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <div>
              <p className="text-xs text-green-600 font-semibold">Växt</p>
              <p className="font-bold text-gray-800">{check.plant.name}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-green-600 shrink-0" />
          </Link>
        )}

        <NotesEditor    checkId={check.id} initialNotes={check.notes} />
        <FollowUpSection checkId={check.id} followUps={check.followUps} />
        <ReminderForm   checkId={check.id} plantName={check.plant?.name ?? null} />
        <SharePanel     check={check}      symptoms={symptoms} />
      </div>
    </div>
  );
}

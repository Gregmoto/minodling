"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, RefreshCw, ArrowRight, Plus, Loader2 } from "lucide-react";
import { toggleWeeklyTask, regenerateWeeklyTasks, addManualWeeklyTask } from "@/app/odlingsvecka/actions";
import { TASK_SOURCES } from "@/app/odlingsvecka/constants";

interface Task {
  id:          string;
  title:       string;
  description: string | null;
  icon:        string | null;
  source:      string;
  done:        boolean;
}

interface WeeklyTaskWidgetProps {
  tasks:       Task[];
  weekNumber:  number;
  /** true = visa full version med lägga till-knapp */
  expanded?:   boolean;
}

export function WeeklyTaskWidget({ tasks, weekNumber, expanded = false }: WeeklyTaskWidgetProps) {
  const [isPending, start] = useTransition();
  const [showAdd,   setShowAdd] = useState(false);

  const done  = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Progress-rad */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>{done}/{total} klara</span>
          <span className="font-medium text-gray-700">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Uppgiftslista */}
      <ul className="flex-1 divide-y divide-gray-50">
        {tasks.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-gray-400">
            Inga uppgifter genererades – lägg till växter i din dagbok för bättre förslag!
          </li>
        )}
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>

      {/* Lägg till manuell uppgift (expanded-läge) */}
      {expanded && (
        <div className="border-t border-gray-50 px-5 py-3">
          {showAdd ? (
            <AddTaskForm onClose={() => setShowAdd(false)} />
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              <Plus className="h-4 w-4" /> Lägg till uppgift
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-50 px-5 py-3 flex items-center justify-between gap-2">
        <button
          onClick={() => start(() => regenerateWeeklyTasks())}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
          {isPending
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <RefreshCw className="h-3 w-3" />}
          Generera om
        </button>
        {!expanded && (
          <Link href="/odlingsvecka" className="flex items-center gap-1 text-xs text-green-700 hover:text-green-800 transition-colors">
            Hela veckan <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [isPending, start] = useTransition();
  const source = TASK_SOURCES[task.source as keyof typeof TASK_SOURCES];

  return (
    <li className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors group">
      <button
        onClick={() => start(() => toggleWeeklyTask(task.id))}
        disabled={isPending}
        className="mt-0.5 flex-shrink-0 disabled:opacity-50 transition-opacity">
        {isPending
          ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          : task.done
            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
            : <Circle className="h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors" />}
      </button>

      <span className="text-base flex-shrink-0 leading-none mt-0.5" aria-hidden>
        {task.icon ?? "🌿"}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>
          {task.title}
        </p>
        {task.description && !task.done && (
          <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">{task.description}</p>
        )}
        {source && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-300 mt-0.5">
            {source.icon} {source.label}
          </span>
        )}
      </div>
    </li>
  );
}

function AddTaskForm({ onClose }: { onClose: () => void }) {
  const [isPending, start] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      await addManualWeeklyTask(fd);
      onClose();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="title"
        required
        maxLength={120}
        placeholder="Beskriv uppgiften..."
        autoFocus
        className="flex-1 text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-200"
      />
      <button type="submit" disabled={isPending}
        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Lägg till"}
      </button>
      <button type="button" onClick={onClose}
        className="px-2 py-1.5 text-gray-400 hover:text-gray-600 text-xs transition-colors">
        Avbryt
      </button>
    </form>
  );
}

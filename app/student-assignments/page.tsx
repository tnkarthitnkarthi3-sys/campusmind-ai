"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
} from "lucide-react";

type Assignment = {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  dueDate: string;
  assignedDate: string;
  totalMarks: number;
  priority: string;
  status: string;
  attachmentUrl?: string | null;
};

export default function StudentOfficialAssignmentsPage() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/student/official-assignments",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load assignments"
        );
      }

      setItems(data.assignments || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load assignments"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/10 p-3">
              <FileText className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Official Assignments
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Assignments published by your faculty and
                administration.
              </p>
            </div>
          </div>
        </header>

        {loading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6">
            <p className="font-semibold text-red-700">
              {error}
            </p>

            <button
              onClick={load}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-400" />

            <h2 className="mt-4 font-semibold text-slate-900">
              No assignments published
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Published assignments will appear here.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-8 space-y-5">
            {items.map((item) => {
              const due = new Date(item.dueDate);
              const overdue = due.getTime() < Date.now();

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {item.status}
                        </span>

                        <span
                          className={`rounded-lg px-3 py-1 text-xs font-bold ${
                            item.priority === "HIGH"
                              ? "bg-red-50 text-red-700"
                              : item.priority === "LOW"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {item.priority} PRIORITY
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-bold text-slate-900">
                        {item.title}
                      </h2>

                      {item.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>
                      )}

                      {item.instructions && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Instructions
                          </p>

                          <p className="mt-2 text-sm text-slate-700">
                            {item.instructions}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="lg:min-w-[250px]">
                      <div
                        className={`rounded-2xl p-5 ${
                          overdue
                            ? "bg-red-50"
                            : "bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {overdue ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <CalendarDays className="h-5 w-5 text-slate-700" />
                          )}

                          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            {overdue
                              ? "Deadline Passed"
                              : "Due Date"}
                          </span>
                        </div>

                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {due.toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-600">
                          {item.totalMarks} marks
                        </p>
                      </div>

                      {item.attachmentUrl && (
                        <a
                          href={item.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Open Attachment
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
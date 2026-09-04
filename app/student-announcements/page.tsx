"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  Megaphone,
} from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  message?: string | null;
  description?: string | null;
  createdAt: string;
};

export default function StudentAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/student/announcements",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load announcements"
        );
      }

      setItems(data.announcements || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load announcements"
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
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/10 p-3">
              <Megaphone className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                College Announcements
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Official announcements from the administration.
              </p>
            </div>
          </div>
        </header>

        {loading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />

              <p className="font-semibold text-red-700">
                {error}
              </p>
            </div>

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
            <Bell className="mx-auto h-10 w-10 text-slate-400" />

            <h2 className="mt-4 font-semibold text-slate-900">
              No announcements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              New official announcements will appear here.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <section className="mt-8 space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="shrink-0 rounded-xl bg-slate-100 p-3">
                    <Megaphone className="h-5 w-5 text-slate-700" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h2>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {item.message ||
                        item.description ||
                        "Official college announcement"}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays className="h-4 w-4" />

                      {new Date(
                        item.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
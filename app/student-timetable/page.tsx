"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";

type TimetableEntry = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  section?: string | null;

  subject?: {
    id: string;
    name: string;
    code: string;
  };

  faculty?: {
    id: string;
    name: string;
    email: string;
  };
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function StudentTimetablePage() {
  const [items, setItems] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/student/timetable",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load timetable"
        );
      }

      setItems(data.timetable || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load timetable"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    return days.map((day) => ({
      day,
      entries: items
        .filter((item) => item.day === day)
        .sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        ),
    }));
  }, [items]);

  return (
    <main className="min-h-screen bg-slate-50 p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/10 p-3">
              <CalendarDays className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Official Timetable
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Your current semester timetable published by
                the administration.
              </p>
            </div>
          </div>
        </header>

        {loading && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-2xl bg-white"
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
            <CalendarDays className="mx-auto h-10 w-10 text-slate-400" />

            <h2 className="mt-4 font-semibold text-slate-900">
              Timetable not published
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your official timetable will appear here after
              the administration publishes it.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {grouped.map((group) => (
              <article
                key={group.day}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">
                    {group.day}
                  </h2>

                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {group.entries.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {group.entries.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-400">
                      No classes
                    </div>
                  ) : (
                    group.entries.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="font-semibold text-slate-900">
                          {item.subject?.name || "Subject"}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {item.subject?.code || "-"}
                        </p>

                        <div className="mt-4 space-y-2 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            {item.startTime} - {item.endTime}
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {item.room || "Room not assigned"}
                          </div>

                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4" />
                            {item.faculty?.name || "Faculty not assigned"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
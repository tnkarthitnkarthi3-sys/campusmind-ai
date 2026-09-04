"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  MapPin,
} from "lucide-react";

type Exam = {
  id: string;
  title: string;
  type: string;
  examDate: string;
  startTime: string;
  durationMinutes: number;
  venue: string;
  totalMarks: number;
  passingMarks: number;
};

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadExams() {
    try {
      setLoading(true);

      const response = await fetch("/api/student/exams", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load exams"
        );
      }

      setExams(data.exams || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load exams"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExams();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/10 p-3">
              <GraduationCap className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Official Examination Schedule
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Examination information published by the college
                administration.
              </p>
            </div>
          </div>
        </header>

        {loading && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl bg-white"
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
              onClick={loadExams}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && exams.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-slate-400" />

            <h2 className="mt-4 font-semibold text-slate-900">
              No examinations published
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your college has not published any examinations
              for your current academic profile.
            </p>
          </div>
        )}

        {!loading && !error && exams.length > 0 && (
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            {exams.map((exam) => (
              <article
                key={exam.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {exam.type}
                    </span>

                    <h2 className="mt-3 text-xl font-bold text-slate-900">
                      {exam.title}
                    </h2>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-3">
                    <CalendarDays className="h-5 w-5 text-slate-700" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Info
                    icon={<CalendarDays />}
                    label="Date"
                    value={new Date(
                      exam.examDate
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  />

                  <Info
                    icon={<Clock3 />}
                    label="Time"
                    value={`${exam.startTime} · ${exam.durationMinutes} min`}
                  />

                  <Info
                    icon={<MapPin />}
                    label="Venue"
                    value={exam.venue || "Not assigned"}
                  />

                  <Info
                    icon={<GraduationCap />}
                    label="Marks"
                    value={`${exam.totalMarks} total · ${exam.passingMarks} pass`}
                  />
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="h-4 w-4">
          {icon}
        </span>

        <span className="text-xs font-semibold">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
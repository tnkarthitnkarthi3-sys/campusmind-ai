"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BellRing,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  RefreshCw,
  Clock3,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

type Reminder = {
  id: string;
  type: "ASSIGNMENT" | "EXAM";
  title: string;
  subject: string;
  description?: string | null;
  date: string;
  priority: string;
  status: string;
  link: string;
};

function getDaysLeft(date: string) {
  const now = new Date();
  const target = new Date(date);

  const diff =
    target.getTime() - now.getTime();

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getUrgency(days: number) {
  if (days <= 1) {
    return {
      label: "Urgent",
      className:
        "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (days <= 3) {
    return {
      label: "Soon",
      className:
        "bg-orange-50 text-orange-700 border-orange-200",
    };
  }

  if (days <= 7) {
    return {
      label: "This Week",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Upcoming",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

export default function RemindersPage() {
  const [reminders, setReminders] =
    useState<Reminder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState<"ALL" | "ASSIGNMENT" | "EXAM">(
      "ALL"
    );

  async function loadReminders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/reminders",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Failed to load reminders"
        );
      }

      setReminders(data.reminders || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reminders"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReminders();
  }, []);

  const filteredReminders = useMemo(() => {
    if (filter === "ALL") {
      return reminders;
    }

    return reminders.filter(
      (item) => item.type === filter
    );
  }, [reminders, filter]);

  const assignmentCount =
    reminders.filter(
      (item) => item.type === "ASSIGNMENT"
    ).length;

  const examCount =
    reminders.filter(
      (item) => item.type === "EXAM"
    ).length;

  const urgentCount =
    reminders.filter(
      (item) => getDaysLeft(item.date) <= 3
    ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <div className="mb-2 flex items-center gap-2 text-violet-600">
              <BellRing size={20} />
              <span className="font-bold">
                Smart Academic Alerts
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-950 md:text-4xl">
              Assignments & Exams
            </h1>

            <p className="mt-2 text-slate-500">
              Never miss an important academic deadline.
            </p>
          </div>

          <button
            onClick={loadReminders}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* SUMMARY */}
        <div className="mb-7 grid gap-4 sm:grid-cols-3">

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ClipboardCheck size={22} />
              </div>

              <span className="text-3xl font-black text-slate-950">
                {assignmentCount}
              </span>
            </div>

            <p className="mt-4 text-sm font-bold text-slate-900">
              Pending Assignments
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Submission deadlines
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <GraduationCap size={22} />
              </div>

              <span className="text-3xl font-black text-slate-950">
                {examCount}
              </span>
            </div>

            <p className="mt-4 text-sm font-bold text-slate-900">
              Upcoming Exams
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Exam dates ahead
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle size={22} />
              </div>

              <span className="text-3xl font-black text-slate-950">
                {urgentCount}
              </span>
            </div>

            <p className="mt-4 text-sm font-bold text-slate-900">
              Needs Attention
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Due within 3 days
            </p>
          </div>

        </div>

        {/* FILTERS */}
        <div className="mb-6 flex flex-wrap gap-2">

          <button
            onClick={() => setFilter("ALL")}
            className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
              filter === "ALL"
                ? "bg-slate-950 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>

          <button
            onClick={() =>
              setFilter("ASSIGNMENT")
            }
            className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
              filter === "ASSIGNMENT"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            Assignments
          </button>

          <button
            onClick={() => setFilter("EXAM")}
            className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
              filter === "EXAM"
                ? "bg-violet-600 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            Exams
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">
            <RefreshCw
              className="mx-auto mb-4 animate-spin text-violet-600"
              size={34}
            />

            <p className="font-bold text-slate-700">
              Loading your academic reminders...
            </p>
          </div>
        ) : filteredReminders.length === 0 ? (
          /* EMPTY */
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
              <BellRing size={30} />
            </div>

            <h2 className="text-xl font-black text-slate-950">
              You're all caught up!
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No upcoming assignments or exams
              need your attention right now.
            </p>

          </div>
        ) : (
          /* REMINDERS */
          <div className="grid gap-4">

            {filteredReminders.map((item) => {
              const daysLeft =
                getDaysLeft(item.date);

              const urgency =
                getUrgency(daysLeft);

              const isExam =
                item.type === "EXAM";

              return (
                <div
                  key={item.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">

                    {/* ICON */}
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        isExam
                          ? "bg-violet-50 text-violet-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {isExam ? (
                        <GraduationCap size={26} />
                      ) : (
                        <ClipboardCheck size={25} />
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-lg font-black text-slate-950 md:text-xl">
                          {item.title}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase ${urgency.className}`}
                        >
                          {urgency.label}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${
                            isExam
                              ? "bg-violet-50 text-violet-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {isExam
                            ? "Exam"
                            : "Assignment"}
                        </span>

                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        {item.subject}
                      </p>

                      {item.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                        <span className="flex items-center gap-2">
                          <CalendarClock size={16} />
                          {formatDate(item.date)}
                        </span>

                        <span className="flex items-center gap-2">
                          <Clock3 size={16} />
                          {formatTime(item.date)}
                        </span>

                        <span className="font-bold text-slate-700">
                          {daysLeft === 0
                            ? "Due today"
                            : daysLeft === 1
                            ? "1 day left"
                            : `${daysLeft} days left`}
                        </span>

                      </div>
                    </div>

                    {/* ACTION */}
                    <Link
                      href={item.link}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      View
                      <ArrowRight size={16} />
                    </Link>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}

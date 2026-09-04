"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type OnlineTest = {
  id: string;
  title: string;
  description?: string | null;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
};

type ApiResponse = {
  success: boolean;
  tests?: OnlineTest[];
  message?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTestState(test: OnlineTest) {
  const now = Date.now();

  const start = test.startDate
    ? new Date(test.startDate).getTime()
    : null;

  const end = test.endDate
    ? new Date(test.endDate).getTime()
    : null;

  if (start && now < start) {
    return {
      label: "Upcoming",
      className:
        "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    };
  }

  if (end && now > end) {
    return {
      label: "Closed",
      className:
        "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    };
  }

  return {
    label: "Available",
    className:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  };
}

export default function StudentOnlineTestsPage() {
  const [tests, setTests] = useState<OnlineTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTests = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/student/online-tests", {
        method: "GET",
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load online tests."
        );
      }

      setTests(data.tests || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load online tests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const stats = useMemo(() => {
    const now = Date.now();

    let available = 0;
    let upcoming = 0;
    let closed = 0;

    for (const test of tests) {
      const start = test.startDate
        ? new Date(test.startDate).getTime()
        : null;

      const end = test.endDate
        ? new Date(test.endDate).getTime()
        : null;

      if (start && now < start) {
        upcoming++;
      } else if (end && now > end) {
        closed++;
      } else {
        available++;
      }
    }

    return {
      total: tests.length,
      available,
      upcoming,
      closed,
    };
  }, [tests]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <GraduationCap size={22} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-950">
                CampusMind AI
              </p>

              <p className="text-xs font-medium text-slate-500">
                Student Academic Portal
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-9">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                <Sparkles size={14} />
                Online Assessment Center
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Online Tests
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                View your assigned online assessments, check test
                schedules, and start available examinations securely.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadTests(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <RefreshCw size={17} />
              )}

              Refresh Tests
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<FileQuestion size={19} />}
            label="Total Tests"
            value={stats.total}
          />

          <StatCard
            icon={<CheckCircle2 size={19} />}
            label="Available"
            value={stats.available}
          />

          <StatCard
            icon={<CalendarDays size={19} />}
            label="Upcoming"
            value={stats.upcoming}
          />

          <StatCard
            icon={<Clock3 size={19} />}
            label="Closed"
            value={stats.closed}
          />
        </section>

        {/* CONTENT */}
        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Assessments
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Your Online Tests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tests assigned to your academic course and semester.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <LoadingCard />
              <LoadingCard />
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <RefreshCw size={21} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-red-900">
                Unable to load tests
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => loadTests(true)}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : tests.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <FileQuestion size={27} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No online tests available
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                There are currently no online tests assigned to your
                department, course, and semester.
              </p>

              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to Dashboard
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {tests.map((test) => {
                const state = getTestState(test);

                return (
                  <article
                    key={test.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="border-b border-slate-100 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <BookOpen size={22} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-slate-950">
                              {test.title}
                            </h3>

                            <p className="mt-1 text-xs font-medium text-slate-400">
                              Online Assessment
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${state.className}`}
                        >
                          {state.label}
                        </span>
                      </div>

                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
                        {test.description ||
                          "Complete this assessment within the scheduled time and submit your answers before the deadline."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-px border-b border-slate-100 bg-slate-100">
                      <InfoItem
                        icon={<Clock3 size={16} />}
                        label="Duration"
                        value={`${test.duration} min`}
                      />

                      <InfoItem
                        icon={<Target size={16} />}
                        label="Total Marks"
                        value={`${test.totalMarks}`}
                      />

                      <InfoItem
                        icon={<CheckCircle2 size={16} />}
                        label="Pass Marks"
                        value={`${test.passingMarks}`}
                      />

                      <InfoItem
                        icon={<FileQuestion size={16} />}
                        label="Test ID"
                        value={test.id.slice(0, 10)}
                      />
                    </div>

                    <div className="space-y-3 p-6">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <CalendarDays
                            size={17}
                            className="mt-0.5 shrink-0 text-slate-500"
                          />

                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Schedule
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              Starts: {formatDate(test.startDate)}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              Ends: {formatDate(test.endDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={state.label !== "Available"}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        {state.label === "Available"
                          ? "Start Test"
                          : state.label === "Upcoming"
                            ? "Test Not Started"
                            : "Test Closed"}

                        {state.label === "Available" && (
                          <ArrowRight size={17} />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500">
        {label}
      </p>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-1.5 truncate text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-200" />

          <div className="flex-1">
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
          </div>
        </div>

        <div className="mt-5 h-4 w-full rounded bg-slate-100" />
        <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
      </div>

      <div className="h-24 bg-slate-50" />

      <div className="p-6">
        <div className="h-12 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
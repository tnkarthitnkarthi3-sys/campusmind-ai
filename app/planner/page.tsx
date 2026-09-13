"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Lightbulb,
} from "lucide-react";

type UpcomingItem = {
  id?: string;
  type?: "assignment" | "exam";
  title?: string;
  subject?: string;
  date?: string;
  priority?: string;
  status?: string;
};

type DashboardData = {
  success?: boolean;

  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };

  attendance?: {
    total?: number;
    present?: number;
    absent?: number;
    percentage?: number;
    subjects?: Array<{
      name?: string;
      percentage?: number;
      attendance?: string;
    }>;
  };

  assignments?: {
    total?: number;
    pending?: number;
    inProgress?: number;
    completed?: number;
  };

  study?: {
    weeklyHours?: number;
    weeklyGoalHours?: number;
    percentage?: number;
    remainingHours?: number;
    completedSessions?: number;
    totalSessions?: number;
  };

  exams?: {
    total?: number;
    upcoming?: number;
  };

  upcoming?: UpcomingItem[];
};

type PlannerResponse = {
  success: boolean;
  plan?: string;
  message?: string;
};

export default function PlannerPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Unable to load academic data."
        );
      }

      console.log("CampusMind Planner Dashboard:", data);

      setDashboard(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your academic data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * IMPORTANT:
   * /api/dashboard returns:
   *
   * assignments = summary object
   * exams = summary object
   * attendance.subjects = actual subjects
   * upcoming = mixed assignment/exam records
   */

  const upcoming = useMemo<UpcomingItem[]>(
    () => dashboard?.upcoming ?? [],
    [dashboard]
  );

  const assignments = useMemo(
    () =>
      upcoming.filter(
        (item) => item.type === "assignment"
      ),
    [upcoming]
  );

  const exams = useMemo(
    () =>
      upcoming.filter(
        (item) => item.type === "exam"
      ),
    [upcoming]
  );

  const subjects = useMemo(
    () => dashboard?.attendance?.subjects ?? [],
    [dashboard]
  );

  const pendingAssignments = useMemo(
    () =>
      assignments.filter(
        (item) =>
          String(item.status || "").toUpperCase() !==
            "COMPLETED" &&
          String(item.status || "").toUpperCase() !==
            "DONE"
      ),
    [assignments]
  );

  const highPriorityAssignments = useMemo(
    () =>
      pendingAssignments.filter(
        (item) =>
          String(item.priority || "").toUpperCase() ===
          "HIGH"
      ),
    [pendingAssignments]
  );

  const weeklyHours =
    dashboard?.study?.weeklyHours ?? 0;

  const goalHours =
    dashboard?.study?.weeklyGoalHours ?? 20;

  const studyPercentage =
    dashboard?.study?.percentage ??
    Math.min(
      100,
      Math.round(
        (weeklyHours / Math.max(goalHours, 1)) * 100
      )
    );

  async function generatePlan() {
    try {
      setGenerating(true);
      setError("");

      const response = await fetch("/api/study-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendance: {
            percentage:
              dashboard?.attendance?.percentage ?? 0,
            attended:
              dashboard?.attendance?.present ?? 0,
            total:
              dashboard?.attendance?.total ?? 0,
          },

          assignments,

          exams,

          subjects: subjects.map((subject) => ({
            name: subject.name,
            percentage: subject.percentage,
            attendance: subject.attendance,
          })),

          studyHours: weeklyHours,
        }),
      });

      const data =
        (await response.json()) as PlannerResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to generate study plan."
        );
      }

      setPlan(data.plan || "");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate your AI study plan."
      );
    } finally {
      setGenerating(false);
    }
  }

  function formatDate(value?: string) {
    if (!value) return "No date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b16] text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />

            <span className="text-sm text-slate-300">
              Loading your academic data...
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b16] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/15 via-white/[0.04] to-cyan-500/10 p-6 shadow-2xl sm:p-8">

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-indigo-300">
                <BrainCircuit className="h-5 w-5" />

                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  CampusMind AI
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                AI Study Planner
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Your academic data becomes a personalized study strategy.
                Let AI decide what deserves your attention first.
              </p>
            </div>

            <button
              type="button"
              onClick={generatePlan}
              disabled={generating}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
              )}

              {generating
                ? "Creating Plan..."
                : "Generate My AI Plan"}
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Academic Snapshot */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Attendance */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-indigo-500/10 p-2.5">
                <Target className="h-5 w-5 text-indigo-300" />
              </div>

              <span className="text-xs text-slate-500">
                Attendance
              </span>
            </div>

            <p className="mt-5 text-3xl font-black">
              {dashboard?.attendance?.percentage ?? 0}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Academic attendance
            </p>
          </div>

          {/* Assignments */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-500/10 p-2.5">
                <ClipboardList className="h-5 w-5 text-amber-300" />
              </div>

              <span className="text-xs text-slate-500">
                Assignments
              </span>
            </div>

            <p className="mt-5 text-3xl font-black">
              {dashboard?.assignments?.pending ?? pendingAssignments.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Pending assignments
            </p>
          </div>

          {/* Exams */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-rose-500/10 p-2.5">
                <GraduationCap className="h-5 w-5 text-rose-300" />
              </div>

              <span className="text-xs text-slate-500">
                Exams
              </span>
            </div>

            <p className="mt-5 text-3xl font-black">
              {dashboard?.exams?.upcoming ?? exams.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Upcoming examinations
            </p>
          </div>

          {/* Study */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-2.5">
                <Clock3 className="h-5 w-5 text-emerald-300" />
              </div>

              <span className="text-xs text-slate-500">
                Study
              </span>
            </div>

            <p className="mt-5 text-3xl font-black">
              {weeklyHours}

              <span className="ml-1 text-base font-medium text-slate-500">
                / {goalHours}h
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Weekly study progress
            </p>
          </div>
        </section>

        {/* AI Plan + Today's Focus */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

          {/* AI Plan */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-300" />

                  <h2 className="text-lg font-bold">
                    Your AI Plan
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Generated from your current academic workload
                </p>
              </div>

              {plan && (
                <button
                  type="button"
                  onClick={generatePlan}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      generating ? "animate-spin" : ""
                    }`}
                  />

                  Regenerate
                </button>
              )}
            </div>

            {!plan ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
                  <BrainCircuit className="h-7 w-7 text-indigo-300" />
                </div>

                <h3 className="mt-4 text-base font-bold">
                  Your personalized plan is waiting
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  CampusMind AI will analyze your attendance,
                  assignments, exams, subjects and study progress.
                </p>

                <button
                  type="button"
                  onClick={generatePlan}
                  disabled={generating}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold transition hover:bg-indigo-400 disabled:opacity-60"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}

                  Create Study Strategy
                </button>
              </div>
            ) : (
              <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.04] p-5 text-sm leading-7 text-slate-300">
                {plan}
              </div>
            )}
          </div>

          {/* Today's Focus */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">

            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-300" />

              <h2 className="text-lg font-bold">
                Today's Focus
              </h2>
            </div>

            <div className="mt-5 space-y-3">

              <div className="rounded-2xl border border-rose-400/10 bg-rose-500/[0.05] p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-rose-300" />

                  <span className="text-xs font-bold uppercase tracking-wider text-rose-200">
                    High Priority
                  </span>
                </div>

                <p className="mt-2 text-2xl font-black">
                  {highPriorityAssignments.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  assignments need attention
                </p>
              </div>

              <div className="rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.05] p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-300" />

                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Subjects
                  </span>
                </div>

                <p className="mt-2 text-2xl font-black">
                  {subjects.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  subjects available for planning
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.05] p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />

                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    Study Goal
                  </span>
                </div>

                <p className="mt-2 text-2xl font-black">
                  {studyPercentage}%
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  weekly study goal completed
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Assignment + Exam */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Assignment Priorities */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-300" />

                <h2 className="text-lg font-bold">
                  Assignment Priorities
                </h2>
              </div>

              <span className="text-xs text-slate-500">
                {assignments.length} total
              </span>
            </div>

            <div className="mt-5 space-y-3">

              {assignments.slice(0, 5).map(
                (assignment, index) => (
                  <div
                    key={
                      assignment.id ||
                      `${assignment.title}-${index}`
                    }
                    className="rounded-2xl border border-white/10 bg-black/10 p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold text-slate-200">
                          {assignment.title ||
                            "Untitled Assignment"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {assignment.subject ||
                            "General"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                          String(
                            assignment.priority || ""
                          ).toUpperCase() === "HIGH"
                            ? "bg-rose-500/10 text-rose-300"
                            : String(
                                  assignment.priority ||
                                    ""
                                ).toUpperCase() === "LOW"
                              ? "bg-slate-500/10 text-slate-400"
                              : "bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {assignment.priority ||
                          "MEDIUM"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">

                      <span className="text-slate-500">
                        {assignment.status ||
                          "PENDING"}
                      </span>

                      <span className="text-slate-400">
                        {formatDate(
                          assignment.date
                        )}
                      </span>
                    </div>
                  </div>
                )
              )}

              {assignments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                  No assignments available.
                </div>
              )}
            </div>
          </div>

          {/* Exam Preparation */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-rose-300" />

                <h2 className="text-lg font-bold">
                  Exam Preparation
                </h2>
              </div>

              <span className="text-xs text-slate-500">
                {exams.length} upcoming
              </span>
            </div>

            <div className="mt-5 space-y-3">

              {exams.slice(0, 5).map(
                (exam, index) => (
                  <div
                    key={
                      exam.id ||
                      `${exam.title}-${index}`
                    }
                    className="rounded-2xl border border-white/10 bg-black/10 p-4"
                  >

                    <div className="flex items-start gap-3">

                      <div className="rounded-xl bg-rose-500/10 p-2.5">
                        <CalendarDays className="h-4 w-4 text-rose-300" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-bold text-slate-200">
                          {exam.title ||
                            "Upcoming Exam"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {exam.subject ||
                            "General"}
                        </p>

                        <p className="mt-2 text-xs font-medium text-slate-400">
                          {formatDate(
                            exam.date
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}

              {exams.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                  No upcoming exams available.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Smart Tip */}
        <section className="mt-6 rounded-3xl border border-cyan-400/10 bg-cyan-500/[0.04] p-5 sm:p-6">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
              <Lightbulb className="h-5 w-5 text-cyan-300" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-cyan-100">
                Smart Study Tip
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Study your highest-priority task first,
                then move to your weakest subject while
                your concentration is still high.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

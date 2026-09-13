"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
} from "lucide-react";

type Subject = {
  name: string;
  percentage: number;
  attendance: string;
};

type UpcomingItem = {
  id: string;
  type: "assignment" | "exam";
  title: string;
  subject: string;
  date: string;
  priority: string;
  status: string;
};

type DashboardData = {
  success: boolean;
  attendance?: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
    subjects: Subject[];
  };
  study?: {
    weeklyHours: number;
    weeklyGoalHours: number;
    percentage: number;
    remainingHours: number;
    completedSessions: number;
    totalSessions: number;
  };
  upcoming?: UpcomingItem[];
};

type Risk = "HIGH" | "MEDIUM" | "STABLE";

function getRisk(value: number): Risk {
  if (value < 75) return "HIGH";
  if (value < 85) return "MEDIUM";
  return "STABLE";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WeakSubjectCoachPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dashboard", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load dashboard data.");
      }

      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const subjects = dashboard?.attendance?.subjects ?? [];

  const rankedSubjects = useMemo(
    () => [...subjects].sort((a, b) => a.percentage - b.percentage),
    [subjects]
  );

  const weakSubjects = rankedSubjects.filter(
    (subject) => subject.percentage < 85
  );

  const highRiskSubjects = rankedSubjects.filter(
    (subject) => subject.percentage < 75
  );

  const stableSubjects = rankedSubjects.filter(
    (subject) => subject.percentage >= 85
  );

  const upcoming = dashboard?.upcoming ?? [];

  const assignments = upcoming.filter(
    (item) =>
      item.type === "assignment" &&
      item.status.toUpperCase() !== "COMPLETED"
  );

  const exams = upcoming.filter((item) => item.type === "exam");

  const average = subjects.length
    ? Math.round(
        subjects.reduce((sum, subject) => sum + subject.percentage, 0) /
          subjects.length
      )
    : 0;

  const generatePlan = async () => {
    if (!dashboard) return;

    try {
      setGenerating(true);
      setError("");

      const response = await fetch("/api/weak-subject-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subjects,
          assignments,
          exams,
          studyHours: dashboard.study?.weeklyHours ?? 0,
          weeklyGoalHours: dashboard.study?.weeklyGoalHours ?? 20,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to generate coaching plan."
        );
      }

      setPlan(data.answer);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate coaching plan."
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b14] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading academic intelligence...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/15 via-[#101827] to-cyan-500/10 p-6 shadow-2xl sm:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-300">
                <BrainCircuit className="h-4 w-4" />
                AI ACADEMIC COACH
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Weak Subject Coach
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                CampusMind AI analyzes your subjects, attendance, assignments
                and upcoming exams to create a focused improvement strategy.
              </p>
            </div>

            <button
              onClick={generatePlan}
              disabled={generating || subjects.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : plan ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}

              {generating
                ? "Analyzing..."
                : plan
                  ? "Regenerate Plan"
                  : "Generate My Coach Plan"}
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* STATS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            icon={Target}
            title="Academic Average"
            value={`${average}%`}
            text="Across all subjects"
          />

          <Stat
            icon={TrendingDown}
            title="Subjects to Improve"
            value={weakSubjects.length}
            text="Below 85%"
          />

          <Stat
            icon={AlertTriangle}
            title="High Risk"
            value={highRiskSubjects.length}
            text="Below 75%"
          />

          <Stat
            icon={Clock3}
            title="Weekly Study"
            value={`${dashboard?.study?.weeklyHours ?? 0}/${dashboard?.study?.weeklyGoalHours ?? 20}h`}
            text="Current progress"
          />
        </section>

        {/* SUBJECT HEALTH */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">Subject Health</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ranked from highest attention needed to strongest.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rankedSubjects.map((subject, index) => {
              const risk = getRisk(subject.percentage);

              return (
                <div
                  key={subject.name}
                  className="rounded-2xl border border-white/10 bg-[#0d1421] p-5 transition hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          {subject.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Attendance: {subject.attendance}
                        </p>
                      </div>
                    </div>

                    <RiskBadge risk={risk} />
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold">
                        {subject.percentage}%
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        performance
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                      style={{
                        width: `${Math.min(subject.percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI + SIDE */}
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <div className="rounded-3xl border border-white/10 bg-[#0b111d] p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-300" />
                  <h2 className="text-xl font-bold">
                    AI Improvement Coach
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Your personalized academic improvement strategy.
                </p>
              </div>

              {plan && (
                <button
                  onClick={generatePlan}
                  disabled={generating}
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      generating ? "animate-spin" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {!plan ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
                  <BrainCircuit className="h-8 w-8 text-violet-300" />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  Ready to coach you
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Generate your AI plan to identify weak subjects and build a
                  realistic 7-day improvement strategy.
                </p>

                <button
                  onClick={generatePlan}
                  disabled={generating}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold hover:bg-violet-400 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Strategy
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <article className="prose prose-invert prose-sm max-w-none pt-6 prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300 prose-th:border-white/10 prose-th:bg-white/5 prose-td:border-white/10">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </article>
            )}
          </div>

          <div className="space-y-6">
            {/* RISK */}
            <div className="rounded-3xl border border-white/10 bg-[#0d1421] p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
                <h2 className="font-bold">Risk Summary</h2>
              </div>

              <div className="mt-5 space-y-3">
                <RiskRow
                  title="High Risk"
                  value={highRiskSubjects.length}
                  text="Below 75%"
                  className="text-red-300"
                />

                <RiskRow
                  title="Needs Attention"
                  value={weakSubjects.length - highRiskSubjects.length}
                  text="75% – 84%"
                  className="text-amber-300"
                />

                <RiskRow
                  title="Stable"
                  value={stableSubjects.length}
                  text="85% and above"
                  className="text-emerald-300"
                />
              </div>
            </div>

            {/* ATTENDANCE */}
            <div className="rounded-3xl border border-white/10 bg-[#0d1421] p-5">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-cyan-300" />
                <h2 className="font-bold">Attendance Watch</h2>
              </div>

              <div className="mt-5">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold">
                    {dashboard?.attendance?.percentage ?? 0}%
                  </span>

                  <span className="text-xs text-slate-500">
                    overall
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{
                      width: `${Math.min(
                        dashboard?.attendance?.percentage ?? 0,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Keep attendance healthy and pay extra attention to subjects
                  with lower attendance.
                </p>
              </div>
            </div>

            {/* UPCOMING */}
            <div className="rounded-3xl border border-white/10 bg-[#0d1421] p-5">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-violet-300" />
                <h2 className="font-bold">Upcoming Pressure</h2>
              </div>

              <div className="mt-5 space-y-3">
                {upcoming.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.title}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.subject}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-300">
                        {item.type === "exam" ? "EXAM" : "TASK"}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-600">
                      {formatDate(item.date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/10 via-[#0d1421] to-cyan-500/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-300" />
                <h2 className="font-bold">Your 7-Day Mission</h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Improve your weakest subject first and maintain your strongest
                subjects.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <span className="text-sm text-slate-400">
                Weekly target{" "}
              </span>

              <span className="font-bold text-white">
                {dashboard?.study?.weeklyGoalHours ?? 20}h
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {[
              "Analyze",
              "Learn",
              "Practice",
              "Revise",
              "Test",
              "Fix Errors",
              "Review",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-black/10 p-4 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Day {index + 1}
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-200">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  title,
  value,
  text,
}: {
  icon: typeof Target;
  title: string;
  value: string | number;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1421] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
        <Icon className="h-5 w-5 text-violet-300" />
      </div>

      <p className="mt-5 text-xs text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{text}</p>
    </div>
  );
}

function RiskBadge({ risk }: { risk: Risk }) {
  const styles =
    risk === "HIGH"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : risk === "MEDIUM"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

  const label =
    risk === "HIGH"
      ? "HIGH RISK"
      : risk === "MEDIUM"
        ? "ATTENTION"
        : "STABLE";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles}`}
    >
      {label}
    </span>
  );
}

function RiskRow({
  title,
  value,
  text,
  className,
}: {
  title: string;
  value: number;
  text: string;
  className: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3">
      <div>
        <p className={`text-sm font-semibold ${className}`}>{title}</p>
        <p className="mt-0.5 text-[11px] text-slate-600">{text}</p>
      </div>

      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}

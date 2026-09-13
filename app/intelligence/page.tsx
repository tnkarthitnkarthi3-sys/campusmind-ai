"use client";

import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Subject = {
  name: string;
  percentage: number;
  attendance: string;
};

type DashboardData = {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  attendance: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
    subjects: Subject[];
  };
  assignments: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  study: {
    weeklyHours: number;
    weeklyGoalHours: number;
    percentage: number;
    remainingHours: number;
    completedSessions: number;
  };
  exams: {
    total: number;
    upcoming: number;
  };
};

type SubjectAnalysis = Subject & {
  attended: number;
  totalClasses: number;
  classesNeeded: number;
  safeLeaves: number;
  risk: "HIGH" | "MEDIUM" | "LOW";
};

const TARGET_ATTENDANCE = 75;

function parseAttendance(value: string, percentage: number) {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);

  if (match) {
    return {
      attended: Number(match[1]),
      totalClasses: Number(match[2]),
    };
  }

  const totalClasses = 100;
  const attended = Math.round((percentage / 100) * totalClasses);

  return {
    attended,
    totalClasses,
  };
}

function calculateClassesNeeded(
  attended: number,
  totalClasses: number,
  target = TARGET_ATTENDANCE
) {
  if (totalClasses <= 0) return 0;

  const current = (attended / totalClasses) * 100;

  if (current >= target) return 0;

  return Math.ceil(
    (target * totalClasses - 100 * attended) / (100 - target)
  );
}

function calculateSafeLeaves(
  attended: number,
  totalClasses: number,
  target = TARGET_ATTENDANCE
) {
  const current = (attended / totalClasses) * 100;

  if (current < target) return 0;

  return Math.max(
    0,
    Math.floor(attended / (target / 100) - totalClasses)
  );
}

function getRisk(percentage: number): "HIGH" | "MEDIUM" | "LOW" {
  if (percentage < 75) return "HIGH";
  if (percentage < 85) return "MEDIUM";
  return "LOW";
}

function getRiskLabel(risk: "HIGH" | "MEDIUM" | "LOW") {
  if (risk === "HIGH") return "Critical";
  if (risk === "MEDIUM") return "Needs attention";
  return "Healthy";
}

function getRiskClass(risk: "HIGH" | "MEDIUM" | "LOW") {
  if (risk === "HIGH") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (risk === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getPerformanceLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "At Risk";
}

function getPerformanceClass(score: number) {
  if (score >= 80) {
    return "text-emerald-600";
  }

  if (score >= 70) {
    return "text-blue-600";
  }

  if (score >= 60) {
    return "text-amber-600";
  }

  return "text-red-600";
}

export default function IntelligencePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load academic data");
      }

      setData(result);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load intelligence data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const subjectAnalysis = useMemo<SubjectAnalysis[]>(() => {
    if (!data) return [];

    return data.attendance.subjects.map((subject) => {
      const parsed = parseAttendance(
        subject.attendance,
        subject.percentage
      );

      return {
        ...subject,
        attended: parsed.attended,
        totalClasses: parsed.totalClasses,
        classesNeeded: calculateClassesNeeded(
          parsed.attended,
          parsed.totalClasses
        ),
        safeLeaves: calculateSafeLeaves(
          parsed.attended,
          parsed.totalClasses
        ),
        risk: getRisk(subject.percentage),
      };
    });
  }, [data]);

  const weakSubjects = useMemo(
    () =>
      [...subjectAnalysis]
        .filter((subject) => subject.percentage < TARGET_ATTENDANCE)
        .sort((a, b) => a.percentage - b.percentage),
    [subjectAnalysis]
  );

  const strongSubjects = useMemo(
    () =>
      [...subjectAnalysis]
        .filter((subject) => subject.percentage >= 85)
        .sort((a, b) => b.percentage - a.percentage),
    [subjectAnalysis]
  );

  const averageSubjectAttendance = useMemo(() => {
    if (!subjectAnalysis.length) return 0;

    return Math.round(
      subjectAnalysis.reduce(
        (sum, subject) => sum + subject.percentage,
        0
      ) / subjectAnalysis.length
    );
  }, [subjectAnalysis]);

  const assignmentScore = useMemo(() => {
    if (!data || data.assignments.total === 0) return 100;

    return Math.round(
      (data.assignments.completed / data.assignments.total) * 100
    );
  }, [data]);

  const studyScore = data?.study.percentage ?? 0;

  const overallPerformance = useMemo(() => {
    if (!data) return 0;

    return Math.round(
      averageSubjectAttendance * 0.45 +
        assignmentScore * 0.25 +
        studyScore * 0.3
    );
  }, [data, averageSubjectAttendance, assignmentScore, studyScore]);

  const attendancePrediction = useMemo(() => {
    if (!data) {
      return {
        current: 0,
        after5: 0,
        after10: 0,
        trend: "stable",
      };
    }

    const current = data.attendance.percentage;

    const after5 =
      data.attendance.total > 0
        ? ((data.attendance.present + 5) /
            (data.attendance.total + 5)) *
          100
        : current;

    const after10 =
      data.attendance.total > 0
        ? ((data.attendance.present + 10) /
            (data.attendance.total + 10)) *
          100
        : current;

    return {
      current: Math.round(current),
      after5: Math.round(after5),
      after10: Math.round(after10),
      trend:
        current >= TARGET_ATTENDANCE
          ? "safe"
          : "needs-recovery",
    };
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-400" />
              <h2 className="text-lg font-bold">
                Analyzing your academic data...
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                CampusMind Intelligence is calculating your insights.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-xl pt-24 text-center">
          <AlertTriangle className="mx-auto mb-5 text-red-400" size={44} />

          <h1 className="text-2xl font-black">
            Intelligence unavailable
          </h1>

          <p className="mt-3 text-slate-400">
            {error || "Academic data could not be loaded."}
          </p>

          <button
            onClick={loadData}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-200"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950 via-slate-900 to-indigo-950 p-6 shadow-2xl sm:p-8">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200">
                <Sparkles size={14} />
                CAMPUSMIND INTELLIGENCE
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Academic Intelligence
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Hi {data.user.name}. Your academic data is converted into
                practical predictions, attendance guidance and performance
                insights.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Overall Performance
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span
                  className={`text-5xl font-black ${getPerformanceClass(
                    overallPerformance
                  )}`}
                >
                  {overallPerformance}
                </span>
                <span className="mb-2 text-sm text-slate-400">
                  / 100
                </span>
              </div>

              <p
                className={`mt-1 text-sm font-bold ${getPerformanceClass(
                  overallPerformance
                )}`}
              >
                {getPerformanceLabel(overallPerformance)}
              </p>
            </div>
          </div>
        </section>

        {/* TOP STATS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <CalendarCheck2 size={21} />
              </div>
              <TrendingUp className="text-emerald-400" size={18} />
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Current Attendance
            </p>

            <p className="mt-1 text-3xl font-black">
              {data.attendance.percentage}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {data.attendance.present} present / {data.attendance.total} classes
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <BookOpen size={21} />
              </div>
              <CheckCircle2 className="text-emerald-400" size={18} />
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Assignment Completion
            </p>

            <p className="mt-1 text-3xl font-black">
              {assignmentScore}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {data.assignments.completed} completed / {data.assignments.total} total
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                <Clock3 size={21} />
              </div>
              <Target className="text-violet-400" size={18} />
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Study Progress
            </p>

            <p className="mt-1 text-3xl font-black">
              {studyScore}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {data.study.weeklyHours}h / {data.study.weeklyGoalHours}h weekly goal
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
                <GraduationCap size={21} />
              </div>
              <Activity className="text-blue-400" size={18} />
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Subject Average
            </p>

            <p className="mt-1 text-3xl font-black">
              {averageSubjectAttendance}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Across {subjectAnalysis.length} subjects
            </p>
          </div>
        </section>

        {/* ATTENDANCE PREDICTION */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-blue-400" size={21} />
                <h2 className="text-xl font-black">
                  Attendance Prediction
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Projected attendance if you attend your next classes.
              </p>
            </div>

            <div
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                attendancePrediction.trend === "safe"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-red-400/20 bg-red-400/10 text-red-300"
              }`}
            >
              {attendancePrediction.trend === "safe"
                ? "Attendance is safe"
                : "Recovery recommended"}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Current</p>
              <p className="mt-2 text-4xl font-black">
                {attendancePrediction.current}%
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min(
                      attendancePrediction.current,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">
                After next 5 classes
              </p>
              <p className="mt-2 text-4xl font-black text-emerald-400">
                {attendancePrediction.after5}%
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Assuming all 5 classes are attended
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">
                After next 10 classes
              </p>
              <p className="mt-2 text-4xl font-black text-violet-400">
                {attendancePrediction.after10}%
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Assuming all 10 classes are attended
              </p>
            </div>
          </div>
        </section>

        {/* SAFE LEAVE */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={22} />
            <h2 className="text-xl font-black">
              Safe Leave Calculator
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Minimum target is {TARGET_ATTENDANCE}%. Check how many classes you
            can safely miss or need to attend.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-4 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
              <span>Subject</span>
              <span>Attendance</span>
              <span>Status</span>
              <span>Need</span>
              <span>Safe Leave</span>
            </div>

            {subjectAnalysis.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No subject attendance data available.
              </div>
            ) : (
              subjectAnalysis.map((subject) => (
                <div
                  key={subject.name}
                  className="grid gap-3 border-t border-white/10 px-5 py-5 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] md:items-center"
                >
                  <div>
                    <p className="font-bold">{subject.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {subject.attended} / {subject.totalClasses} classes
                    </p>
                  </div>

                  <div>
                    <span className="text-lg font-black">
                      {subject.percentage}%
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getRiskClass(
                        subject.risk
                      )}`}
                    >
                      {getRiskLabel(subject.risk)}
                    </span>
                  </div>

                  <div>
                    {subject.classesNeeded > 0 ? (
                      <div className="text-sm font-bold text-blue-400">
                        Attend {subject.classesNeeded}
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-emerald-400">
                        Target reached
                      </div>
                    )}
                  </div>

                  <div>
                    {subject.safeLeaves > 0 ? (
                      <div className="text-sm font-bold text-amber-400">
                        {subject.safeLeaves} class
                        {subject.safeLeaves !== 1 ? "es" : ""}
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-red-400">
                        No safe leave
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* WEAK + STRONG */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* WEAK */}
          <div className="rounded-3xl border border-red-400/10 bg-white/5 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="text-red-400" size={21} />
                <h2 className="text-xl font-black">
                  Weak Subjects
                </h2>
              </div>

              <span className="rounded-full bg-red-400/10 px-3 py-1 text-xs font-bold text-red-300">
                {weakSubjects.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              Subjects below the {TARGET_ATTENDANCE}% attendance target.
            </p>

            <div className="mt-5 space-y-3">
              {weakSubjects.length === 0 ? (
                <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-5">
                  <CheckCircle2
                    className="text-emerald-400"
                    size={24}
                  />
                  <p className="mt-3 font-bold">
                    No weak attendance subjects
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Excellent. Keep maintaining your attendance.
                  </p>
                </div>
              ) : (
                weakSubjects.map((subject) => (
                  <div
                    key={subject.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">{subject.name}</p>
                        <p className="mt-1 text-xs text-red-300">
                          {subject.classesNeeded} more class
                          {subject.classesNeeded !== 1 ? "es" : ""} needed
                        </p>
                      </div>

                      <span className="text-2xl font-black text-red-400">
                        {subject.percentage}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width: `${Math.min(
                            subject.percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* STRONG */}
          <div className="rounded-3xl border border-emerald-400/10 bg-white/5 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="text-emerald-400" size={21} />
                <h2 className="text-xl font-black">
                  Strong Subjects
                </h2>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                {strongSubjects.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              Subjects maintaining 85% or higher attendance.
            </p>

            <div className="mt-5 space-y-3">
              {strongSubjects.length === 0 ? (
                <div className="rounded-2xl border border-amber-400/10 bg-amber-400/5 p-5">
                  <Target className="text-amber-400" size={24} />
                  <p className="mt-3 font-bold">
                    No strong subjects yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Aim for 85%+ attendance in every subject.
                  </p>
                </div>
              ) : (
                strongSubjects.map((subject) => (
                  <div
                    key={subject.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">{subject.name}</p>
                        <p className="mt-1 text-xs text-emerald-300">
                          Excellent attendance
                        </p>
                      </div>

                      <span className="text-2xl font-black text-emerald-400">
                        {subject.percentage}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(
                            subject.percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* PERFORMANCE ANALYTICS */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-violet-400" size={22} />
            <h2 className="text-xl font-black">
              Performance Analytics
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Your academic performance is calculated from attendance,
            assignment completion and study progress.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Attendance
                </span>
                <CalendarCheck2
                  size={18}
                  className="text-blue-400"
                />
              </div>

              <div className="mt-4 flex items-end justify-between">
                <span className="text-3xl font-black">
                  {averageSubjectAttendance}%
                </span>
                <span className="text-xs text-slate-500">
                  Weight 45%
                </span>
              </div>

              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min(
                      averageSubjectAttendance,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Assignments
                </span>
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />
              </div>

              <div className="mt-4 flex items-end justify-between">
                <span className="text-3xl font-black">
                  {assignmentScore}%
                </span>
                <span className="text-xs text-slate-500">
                  Weight 25%
                </span>
              </div>

              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(assignmentScore, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Study Progress
                </span>
                <Clock3
                  size={18}
                  className="text-amber-400"
                />
              </div>

              <div className="mt-4 flex items-end justify-between">
                <span className="text-3xl font-black">
                  {studyScore}%
                </span>
                <span className="text-xs text-slate-500">
                  Weight 30%
                </span>
              </div>

              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{
                    width: `${Math.min(studyScore, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* FORMULA */}
          <div className="mt-5 rounded-2xl border border-violet-400/10 bg-violet-400/5 p-5">
            <div className="flex items-start gap-3">
              <Sparkles
                className="mt-0.5 shrink-0 text-violet-400"
                size={20}
              />

              <div>
                <p className="font-bold">
                  Intelligence Score Formula
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Overall Score = Attendance × 45% + Assignment Completion ×
                  25% + Study Progress × 30%.
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  This is a transparent academic indicator, not an official
                  college grade.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SMART RECOMMENDATIONS */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/50 to-slate-900 p-6 shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-violet-300" size={22} />
            <h2 className="text-xl font-black">
              Smart Recommendations
            </h2>
          </div>

          <div className="mt-5 grid gap-3">
            {weakSubjects.length > 0 && (
              <div className="flex gap-4 rounded-2xl border border-red-400/10 bg-red-400/5 p-4">
                <AlertTriangle
                  className="mt-0.5 shrink-0 text-red-400"
                  size={21}
                />

                <div>
                  <p className="font-bold">
                    Focus on {weakSubjects[0].name}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Attendance is {weakSubjects[0].percentage}%. Attend the
                    next {weakSubjects[0].classesNeeded || 1} class
                    {weakSubjects[0].classesNeeded !== 1 ? "es" : ""} to start
                    recovering toward the target.
                  </p>
                </div>
              </div>
            )}

            {data.assignments.pending > 0 && (
              <div className="flex gap-4 rounded-2xl border border-amber-400/10 bg-amber-400/5 p-4">
                <BookOpen
                  className="mt-0.5 shrink-0 text-amber-400"
                  size={21}
                />

                <div>
                  <p className="font-bold">
                    Complete pending assignments
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    You currently have {data.assignments.pending} pending
                    assignment
                    {data.assignments.pending !== 1 ? "s" : ""}. Clearing them
                    will improve your academic workload score.
                  </p>
                </div>
              </div>
            )}

            {studyScore < 75 && (
              <div className="flex gap-4 rounded-2xl border border-blue-400/10 bg-blue-400/5 p-4">
                <Clock3
                  className="mt-0.5 shrink-0 text-blue-400"
                  size={21}
                />

                <div>
                  <p className="font-bold">
                    Increase weekly study time
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Your study goal is at {studyScore}%. Try completing
                    another {data.study.remainingHours} hour
                    {data.study.remainingHours !== 1 ? "s" : ""} this week.
                  </p>
                </div>
              </div>
            )}

            {weakSubjects.length === 0 &&
              data.assignments.pending === 0 &&
              studyScore >= 75 && (
                <div className="flex gap-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-emerald-400"
                    size={21}
                  />

                  <div>
                    <p className="font-bold">
                      You are on a healthy academic track
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Keep maintaining attendance, completing assignments and
                      following your study plan.
                    </p>
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-400/10 p-2.5 text-violet-300">
              <Users size={18} />
            </div>

            <div>
              <p className="text-sm font-bold">
                CampusMind Intelligence Engine
              </p>

              <p className="text-xs text-slate-500">
                Live analysis from your academic dashboard data
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
          >
            Refresh Analysis
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  NotebookTabs,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import NotificationBell from "@/components/NotificationBell";

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
    subjects: {
      name: string;
      percentage: number;
      attendance: string;
    }[];
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
  upcoming: {
    id: string;
    title: string;
    type: string;
    date: string;
    status: string;
  }[];
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/attendance", icon: CalendarDays },
  { label: "Assignments", href: "/assignments", icon: FileText },
  { label: "Study Planner", href: "/planner", icon: Target },
  { label: "Notes", href: "/notes", icon: NotebookTabs },
  { label: "Exams", href: "/exams", icon: GraduationCap },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load dashboard");
      }

      setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to load your academic data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const userName = data?.user.name || "Student";
  const attendance = data?.attendance.percentage ?? 0;
  const assignments = data?.assignments.total ?? 0;
  const studyPercentage = data?.study.percentage ?? 0;
  const studyHours = data?.study.weeklyHours ?? 0;
  const remainingHours = data?.study.remainingHours ?? 0;

  const stats = useMemo(
    () => [
      {
        title: "Attendance",
        value: `${attendance}%`,
        subtitle:
          attendance >= 85
            ? "Excellent attendance"
            : attendance >= 75
              ? "Attendance is healthy"
              : "Attendance needs attention",
        icon: CalendarDays,
        href: "/attendance",
        trend: `${data?.attendance.present ?? 0} present`,
      },
      {
        title: "Assignments",
        value: `${assignments}`,
        subtitle: `${data?.assignments.pending ?? 0} pending`,
        icon: FileText,
        href: "/assignments",
        trend: `${data?.assignments.completed ?? 0} completed`,
      },
      {
        title: "Study Goal",
        value: `${studyPercentage}%`,
        subtitle: "Weekly target",
        icon: Target,
        href: "/planner",
        trend: `${studyHours} hrs`,
      },
      {
        title: "Exams",
        value: `${data?.exams.total ?? 0}`,
        subtitle: "Total scheduled",
        icon: TrendingUp,
        href: "/exams",
        trend: `${data?.exams.upcoming ?? 0} upcoming`,
      },
    ],
    [attendance, assignments, studyPercentage, studyHours, data]
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <BookOpen size={21} />
            </div>

            <div>
              <p className="font-bold tracking-tight">CampusMind AI</p>
              <p className="text-xs text-slate-400">Student Platform</p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.label === "Dashboard";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon
                    size={19}
                    className={
                      active
                        ? "text-cyan-300"
                        : "text-slate-400 group-hover:text-slate-700"
                    }
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Support
          </p>

          <nav className="space-y-1">
            <Link
              href="/ai-assistant"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <MessageSquareText size={19} className="text-slate-400" />
              AI Study Assistant
            </Link>

            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
              <Settings size={19} className="text-slate-400" />
              Settings
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <UserRound size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{userName}</p>
              <p className="truncate text-xs text-slate-400">
                Student Account
              </p>
            </div>

            <MoreHorizontal size={18} className="text-slate-400" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">

        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-5 sm:px-8 lg:px-10">

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="hidden text-xs font-semibold text-slate-400 sm:block">
                  {new Intl.DateTimeFormat("en-IN", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date())}
                </p>

                <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                  {getGreeting()}, {userName} 👋
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />

              <div className="hidden h-10 w-px bg-slate-200 sm:block" />

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold">{userName}</p>
                  <p className="text-xs text-slate-400">Student</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white shadow-lg">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">

          {error && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <span>{error}</span>
              <button
                onClick={loadDashboard}
                className="font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles size={14} className="text-cyan-300" />
                  CampusMind AI Insight
                </div>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {attendance >= 85
                    ? "You're having a strong academic week."
                    : "Let's improve your academic progress."}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  Your dashboard is connected to your live academic data.
                  Keep your attendance, assignments and study sessions updated
                  to track your progress automatically.
                </p>
              </div>

              <Link
                href="/ai-assistant"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-50"
              >
                Open AI Assistant
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </section>

          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
                      <Icon size={20} />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                      {loading ? "Loading" : stat.trend}
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <div className="mt-1 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold tracking-tight">
                        {loading ? "—" : stat.value}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {stat.subtitle}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600"
                    />
                  </div>
                </Link>
              );
            })}
          </section>

          <section className="mt-7 grid gap-7 xl:grid-cols-[1.4fr_0.8fr]">

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="font-bold">Attendance Overview</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Your current attendance by subject
                  </p>
                </div>

                <Link
                  href="/attendance"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View details
                </Link>
              </div>

              <div className="p-6">
                <div className="mb-7 flex items-center gap-6">
                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <div
                      className="absolute inset-2 rounded-full border-[9px] border-indigo-500"
                      style={{
                        background: `conic-gradient(#6366f1 ${attendance}%, #e2e8f0 ${attendance}% 100%)`,
                        border: "none",
                        borderRadius: "9999px",
                      }}
                    />
                    <div className="absolute inset-[11px] flex items-center justify-center rounded-full bg-white">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{attendance}%</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Overall
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={17} className="text-emerald-500" />
                      <p className="text-sm font-bold">
                        {attendance >= 85
                          ? "Excellent attendance"
                          : "Attendance needs attention"}
                      </p>
                    </div>

                    <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
                      {data?.attendance.present ?? 0} present out of{" "}
                      {data?.attendance.total ?? 0} recorded classes.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {(data?.attendance.subjects ?? []).map((subject) => (
                    <div key={subject.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            {subject.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {subject.attendance} classes
                          </p>
                        </div>

                        <p className="text-sm font-bold">
                          {subject.percentage}%
                        </p>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all"
                          style={{ width: `${subject.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {!loading && !data?.attendance.subjects.length && (
                    <p className="py-6 text-center text-sm text-slate-400">
                      No attendance records yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="font-bold">Weekly Study Goal</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Your progress this week
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center py-3">
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-slate-100">
                    <div
                      className="absolute inset-3 rounded-full"
                      style={{
                        background: `conic-gradient(#6366f1 ${studyPercentage}%, #e2e8f0 ${studyPercentage}% 100%)`,
                      }}
                    />

                    <div className="absolute inset-[15px] flex items-center justify-center rounded-full bg-white">
                      <div className="text-center">
                        <p className="text-4xl font-bold">
                          {studyPercentage}%
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {studyHours} / 20 hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      <Clock3 size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        {remainingHours} hours remaining
                      </p>
                      <p className="text-xs text-slate-400">
                        Keep going — you're making progress.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/planner"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Open Study Planner
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-7 grid gap-7 xl:grid-cols-[1.4fr_0.8fr]">

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="font-bold">Upcoming</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Important academic activities
                  </p>
                </div>

                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                  <MoreHorizontal size={19} />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {data?.upcoming.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 px-6 py-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      {task.type === "Assignment" ? (
                        <FileText size={19} />
                      ) : task.type === "Internal Exam" ? (
                        <GraduationCap size={19} />
                      ) : (
                        <BookOpen size={19} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {task.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{task.type}</span>
                        <span>•</span>
                        <span>{formatDate(task.date)}</span>
                        <span>•</span>
                        <span>{formatTime(task.date)}</span>
                      </div>
                    </div>

                    <span
                      className={`hidden rounded-full px-3 py-1.5 text-xs font-semibold sm:block ${
                        task.status === "Due soon"
                          ? "bg-amber-50 text-amber-600"
                          : task.status === "Planned"
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}

                {!loading && !data?.upcoming.length && (
                  <div className="px-6 py-10 text-center text-sm text-slate-400">
                    No upcoming activities.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="font-bold">Quick Actions</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Jump into your frequently used tools
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5">
                <Link
                  href="/assignments"
                  className="group rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <FileText size={21} className="text-indigo-600" />
                  <p className="mt-4 text-sm font-bold">Assignments</p>
                  <p className="mt-1 text-xs text-slate-400">View tasks</p>
                </Link>

                <Link
                  href="/notes"
                  className="group rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-200 hover:bg-cyan-50"
                >
                  <NotebookTabs size={21} className="text-cyan-600" />
                  <p className="mt-4 text-sm font-bold">Notes</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Study materials
                  </p>
                </Link>

                <Link
                  href="/exams"
                  className="group rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <Award size={21} className="text-emerald-600" />
                  <p className="mt-4 text-sm font-bold">Exams</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Exam schedule
                  </p>
                </Link>

                <Link
                  href="/ai-assistant"
                  className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
                >
                  <MessageSquareText
                    size={21}
                    className="text-violet-600"
                  />
                  <p className="mt-4 text-sm font-bold">AI Assistant</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Ask anything
                  </p>
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Activity size={17} />
              </div>

              <div>
                <p className="text-sm font-bold">
                  CampusMind services are operational
                </p>
                <p className="text-xs text-slate-400">
                  Your academic data is connected to the database.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Database connected
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

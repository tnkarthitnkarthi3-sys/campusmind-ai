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
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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

function getAttendanceLabel(value: number) {
  if (value >= 90) return "Excellent";
  if (value >= 85) return "Strong";
  if (value >= 75) return "Healthy";
  return "Needs attention";
}

function getSubjectBar(value: number) {
  if (value >= 85) return "bg-emerald-500";
  if (value >= 75) return "bg-amber-500";
  return "bg-rose-500";
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
  const weeklyGoal = data?.study.weeklyGoalHours ?? 20;
  const remainingHours = data?.study.remainingHours ?? 0;

  const stats = useMemo(
    () => [
      {
        title: "Attendance",
        value: `${attendance}%`,
        subtitle: getAttendanceLabel(attendance),
        icon: CalendarDays,
        href: "/attendance",
        trend: `${data?.attendance.present ?? 0} present`,
        iconClass: "bg-blue-500/10 text-blue-600",
      },
      {
        title: "Assignments",
        value: `${assignments}`,
        subtitle: `${data?.assignments.pending ?? 0} pending`,
        icon: FileText,
        href: "/assignments",
        trend: `${data?.assignments.completed ?? 0} completed`,
        iconClass: "bg-violet-500/10 text-violet-600",
      },
      {
        title: "Study Goal",
        value: `${studyPercentage}%`,
        subtitle: "Weekly progress",
        icon: Target,
        href: "/planner",
        trend: `${studyHours} hrs`,
        iconClass: "bg-cyan-500/10 text-cyan-600",
      },
      {
        title: "Exams",
        value: `${data?.exams.total ?? 0}`,
        subtitle: "Total scheduled",
        icon: GraduationCap,
        href: "/exams",
        trend: `${data?.exams.upcoming ?? 0} upcoming`,
        iconClass: "bg-emerald-500/10 text-emerald-600",
      },
    ],
    [attendance, assignments, studyPercentage, studyHours, data]
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/5 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 4, scale: 1.05 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 text-white shadow-lg shadow-indigo-900/20"
            >
              <BookOpen size={21} />
            </motion.div>

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
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.label === "Dashboard";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-slate-950 to-indigo-950 text-white shadow-lg shadow-slate-950/15"
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

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Intelligence
          </p>

          <nav className="space-y-1.5">
            <Link
              href="/ai-assistant"
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
            >
              <MessageSquareText
                size={19}
                className="text-violet-500"
              />
              AI Study Assistant
            </Link>

            <Link
              href="/weak-subject-coach"
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              <Zap size={19} className="text-cyan-500" />
              Weak Subject Coach
            </Link>
          </nav>

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Support
          </p>

          <nav>
            <Link
              href="/profile"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <Settings size={19} className="text-slate-400" />
              Profile & Settings
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/60 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white shadow-lg">
                {userName.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{userName}</p>
                <p className="truncate text-xs text-slate-400">
                  Student Account
                </p>
              </div>

              <ShieldCheck size={17} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">

        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-2xl">
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

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
                >
                  {userName.slice(0, 2).toUpperCase()}
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
            >
              <span>{error}</span>

              <button
                onClick={loadDashboard}
                className="font-bold underline"
              >
                Retry
              </button>
            </motion.div>
          )}

          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[2rem] bg-[#080d1c] p-6 text-white shadow-2xl shadow-indigo-950/15 sm:p-9"
          >
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-slate-300">
                  <Sparkles size={14} className="text-cyan-300" />
                  CampusMind AI Intelligence
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  Live
                </div>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {attendance >= 85
                    ? "You're having a strong academic week."
                    : "Let's improve your academic progress."}
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                  Your academic dashboard is connected to live data. Track
                  attendance, assignments, study goals and exams from one
                  intelligent workspace.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/ai-assistant"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-cyan-50"
                  >
                    Open AI Assistant
                    <ArrowUpRight size={17} />
                  </Link>

                  <Link
                    href="/intelligence"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    View Intelligence
                    <TrendingUp size={17} />
                  </Link>
                </div>
              </div>

              <div className="hidden shrink-0 lg:block">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <div
                    className="absolute inset-3 rounded-full"
                    style={{
                      background: `conic-gradient(#22d3ee ${attendance}%, rgba(255,255,255,0.08) ${attendance}% 100%)`,
                    }}
                  />

                  <div className="absolute inset-5 flex items-center justify-center rounded-full bg-[#080d1c]">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{attendance}%</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Attendance
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Stats */}
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.07,
                  }}
                >
                  <Link
                    href={stat.href}
                    className="group block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-900/5"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}
                      >
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
                        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </section>

          {/* Main analytics */}
          <section className="mt-7 grid gap-7 xl:grid-cols-[1.35fr_0.75fr]">

            {/* Attendance */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
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
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#6366f1 ${attendance}%, #e8edf5 ${attendance}% 100%)`,
                      }}
                    />

                    <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white">
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
                      <CheckCircle2
                        size={17}
                        className="text-emerald-500"
                      />

                      <p className="text-sm font-bold">
                        {attendance >= 85
                          ? "Excellent attendance"
                          : attendance >= 75
                            ? "Attendance is healthy"
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
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
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
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${subject.percentage}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                          }}
                          className={`h-full rounded-full ${getSubjectBar(
                            subject.percentage
                          )}`}
                        />
                      </div>
                    </div>
                  ))}

                  {!loading &&
                    !data?.attendance.subjects.length && (
                      <p className="py-6 text-center text-sm text-slate-400">
                        No attendance records yet.
                      </p>
                    )}
                </div>
              </div>
            </motion.div>

            {/* Study goal */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="font-bold">Weekly Study Goal</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Your progress this week
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center py-3">
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#6366f1 ${studyPercentage}%, #e8edf5 ${studyPercentage}% 100%)`,
                      }}
                    />

                    <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white">
                      <div className="text-center">
                        <p className="text-4xl font-bold">
                          {studyPercentage}%
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {studyHours} / {weeklyGoal} hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
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
            </motion.div>
          </section>

          {/* Upcoming + actions */}
          <section className="mt-7 grid gap-7 xl:grid-cols-[1.35fr_0.75fr]">

            {/* Upcoming */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
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
                {data?.upcoming.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 px-6 py-5 transition hover:bg-slate-50/70"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      {task.type.toLowerCase().includes("assignment") ? (
                        <FileText size={19} />
                      ) : task.type.toLowerCase().includes("exam") ? (
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

                    <span className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 sm:block">
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
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="font-bold">Quick Actions</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Frequently used academic tools
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5">
                {[
                  {
                    href: "/assignments",
                    title: "Assignments",
                    text: "View tasks",
                    icon: FileText,
                    className: "text-indigo-600 hover:bg-indigo-50",
                  },
                  {
                    href: "/notes",
                    title: "Notes",
                    text: "Study materials",
                    icon: NotebookTabs,
                    className: "text-cyan-600 hover:bg-cyan-50",
                  },
                  {
                    href: "/exams",
                    title: "Exams",
                    text: "Exam schedule",
                    icon: Award,
                    className: "text-emerald-600 hover:bg-emerald-50",
                  },
                  {
                    href: "/ai-assistant",
                    title: "AI Assistant",
                    text: "Ask anything",
                    icon: MessageSquareText,
                    className: "text-violet-600 hover:bg-violet-50",
                  },
                ].map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className={`group rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 ${action.className}`}
                    >
                      <Icon size={21} />

                      <p className="mt-4 text-sm font-bold text-slate-900">
                        {action.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {action.text}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </section>

          {/* System status */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-7 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Activity size={17} />

                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
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
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Database connected
            </div>
          </motion.section>

          <footer className="py-8 text-center text-xs text-slate-400">
            CampusMind AI • Intelligent Academic Platform
          </footer>

        </main>
      </div>
    </div>
  );
}

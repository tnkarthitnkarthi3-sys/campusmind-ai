
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flame,
  LayoutDashboard,
  ListTodo,
  Menu,
  NotebookPen,
  Plus,
  Sparkles,
  Target,
  Timer,
  X,
} from "lucide-react";

const days = [
  { day: "Mon", date: "01" },
  { day: "Tue", date: "02" },
  { day: "Wed", date: "03" },
  { day: "Thu", date: "04" },
  { day: "Fri", date: "05" },
  { day: "Sat", date: "06" },
  { day: "Sun", date: "07" },
];

const sessions = [
  {
    time: "07:30 AM",
    title: "Computer Networks",
    type: "Revision",
    duration: "60 min",
    color: "bg-blue-50 text-blue-700",
    icon: Brain,
  },
  {
    time: "10:30 AM",
    title: "Database Management",
    type: "Assignment",
    duration: "90 min",
    color: "bg-indigo-50 text-indigo-700",
    icon: NotebookPen,
  },
  {
    time: "02:30 PM",
    title: "Data Structures",
    type: "Practice",
    duration: "60 min",
    color: "bg-emerald-50 text-emerald-700",
    icon: BookOpen,
  },
  {
    time: "07:00 PM",
    title: "Operating Systems",
    type: "Deep Study",
    duration: "90 min",
    color: "bg-purple-50 text-purple-700",
    icon: Target,
  },
];

const priorities = [
  {
    title: "Database Normalization Report",
    subject: "Database Management",
    progress: 65,
    due: "Tomorrow, 6:00 PM",
    priority: "High",
  },
  {
    title: "Network Topology Analysis",
    subject: "Computer Networks",
    progress: 35,
    due: "Sep 06, 11:59 PM",
    priority: "Medium",
  },
  {
    title: "Process Scheduling Algorithms",
    subject: "Operating Systems",
    progress: 20,
    due: "Sep 08, 5:00 PM",
    priority: "Medium",
  },
];

export default function PlannerPage() {
  const [selectedDay, setSelectedDay] = useState("03");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Mobile Overlay */}
        {mobileOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="font-bold tracking-tight">CampusMind AI</p>
                  <p className="text-[11px] text-slate-400">
                    Smart Student Platform
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-4 py-6">
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Main Menu
              </p>

              <nav className="space-y-1">
                <SidebarLink
                  href="/dashboard"
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                />
                <SidebarLink
                  href="/attendance"
                  icon={<CheckCircle2 size={18} />}
                  label="Attendance"
                />
                <SidebarLink
                  href="/assignments"
                  icon={<ListTodo size={18} />}
                  label="Assignments"
                />
                <SidebarLink
                  href="/planner"
                  icon={<CalendarDays size={18} />}
                  label="Study Planner"
                  active
                />
                <SidebarLink
                  href="/notes"
                  icon={<NotebookPen size={18} />}
                  label="Notes"
                />
                <SidebarLink
                  href="/exams"
                  icon={<BookOpen size={18} />}
                  label="Exams"
                />
              </nav>

              <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tools
              </p>

              <nav className="space-y-1">
                <SidebarLink
                  href="/ai-assistant"
                  icon={<Sparkles size={18} />}
                  label="AI Study Assistant"
                />
                <SidebarLink
                  href="/settings"
                  icon={<Target size={18} />}
                  label="Settings"
                />
              </nav>
            </div>

            <div className="mt-auto border-t border-slate-100 p-5">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  RK
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Karthikeyan</p>
                  <p className="truncate text-xs text-slate-400">
                    Computer Science
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex h-20 items-center justify-between px-5 sm:px-8 lg:px-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="rounded-xl border border-slate-200 p-2.5 lg:hidden"
                >
                  <Menu size={20} />
                </button>

                <div>
                  <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
                    <Link href="/dashboard" className="hover:text-slate-700">
                      Dashboard
                    </Link>
                    <span>/</span>
                    <span className="text-slate-700">Study Planner</span>
                  </div>
                  <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                    Study Planner
                  </h1>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium">
                  <CalendarDays size={17} className="text-slate-500" />
                  September 2026
                  <ChevronDown size={15} className="text-slate-400" />
                </div>

                <button className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                  <Plus size={17} />
                  Add Session
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
            {/* Intro */}
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-sm font-semibold text-indigo-600">
                  Plan. Focus. Achieve.
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Your study schedule
                </h2>
                <p className="mt-2 max-w-2xl text-slate-500">
                  Organize your study sessions, prioritize assignments, and
                  stay consistent with your academic goals.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Flame size={18} className="text-orange-500" />
                <span>
                  <strong className="text-slate-900">6 day</strong> study
                  streak
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <PlannerStat
                icon={<Clock3 size={20} />}
                label="Study Hours"
                value="15.6 hrs"
                note="of 20 hrs weekly goal"
                iconClass="bg-blue-50 text-blue-600"
              />
              <PlannerStat
                icon={<Target size={20} />}
                label="Weekly Progress"
                value="78%"
                note="+8% from last week"
                iconClass="bg-indigo-50 text-indigo-600"
              />
              <PlannerStat
                icon={<CheckCircle2 size={20} />}
                label="Sessions Done"
                value="12"
                note="3 sessions remaining"
                iconClass="bg-emerald-50 text-emerald-600"
              />
              <PlannerStat
                icon={<Flame size={20} />}
                label="Study Streak"
                value="6 days"
                note="Keep it going!"
                iconClass="bg-orange-50 text-orange-600"
              />
            </div>

            {/* AI Recommendation */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50">
              <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                    <Sparkles size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      AI Study Recommendation
                    </p>
                    <h3 className="mt-1 text-lg font-bold">
                      Focus on Database Management today.
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      Your Database Normalization assignment is due tomorrow
                      and is currently 65% complete. A focused 90-minute
                      session can help you finish it comfortably.
                    </p>
                  </div>
                </div>

                <button className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                  Start Focus Session
                </button>
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.65fr_1fr]">
              {/* Weekly Calendar */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Weekly Schedule</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      September 1 - September 7, 2026
                    </p>
                  </div>

                  <div className="hidden items-center gap-2 sm:flex">
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                      <ArrowLeft size={16} />
                    </button>
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {days.map((item) => {
                    const active = selectedDay === item.date;

                    return (
                      <button
                        key={item.date}
                        onClick={() => setSelectedDay(item.date)}
                        className={`rounded-xl border p-3 text-center transition ${
                          active
                            ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                            : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-semibold uppercase ${
                            active ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {item.day}
                        </p>
                        <p className="mt-1 text-lg font-bold">{item.date}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 space-y-3">
                  {sessions.map((session) => {
                    const Icon = session.icon;

                    return (
                      <div
                        key={session.time}
                        className="group flex flex-col gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-indigo-100 hover:shadow-sm sm:flex-row sm:items-center"
                      >
                        <div className="flex w-24 shrink-0 items-center gap-2 text-sm font-semibold text-slate-500">
                          <Clock3 size={15} />
                          {session.time}
                        </div>

                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${session.color}`}
                        >
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold">{session.title}</h4>
                          <p className="mt-1 text-xs text-slate-400">
                            {session.type} • {session.duration}
                          </p>
                        </div>

                        <button className="self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 opacity-100 transition hover:border-indigo-200 hover:text-indigo-600 sm:self-auto sm:opacity-0 sm:group-hover:opacity-100">
                          Details
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600">
                  <Plus size={17} />
                  Add study session
                </button>
              </section>

              {/* Right column */}
              <div className="space-y-8">
                {/* Goal */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Weekly Study Goal</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        September 1 - 7
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <Target size={20} />
                    </div>
                  </div>

                  <div className="mb-3 flex items-end justify-between">
                    <p className="text-3xl font-bold">78%</p>
                    <p className="text-sm font-medium text-slate-400">
                      15.6 / 20 hrs
                    </p>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[78%] rounded-full bg-indigo-600" />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400">4.4 hours remaining</span>
                    <span className="font-semibold text-emerald-600">
                      On track
                    </span>
                  </div>
                </section>

                {/* Priority */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Priority Tasks</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        What needs your attention
                      </p>
                    </div>

                    <ListTodo size={20} className="text-slate-400" />
                  </div>

                  <div className="space-y-4">
                    {priorities.map((task) => (
                      <div
                        key={task.title}
                        className="rounded-xl border border-slate-100 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold leading-5">
                              {task.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {task.subject}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                              task.priority === "High"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-500">
                            {task.progress}% complete
                          </span>
                          <span className="text-slate-400">{task.due}</span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/assignments"
                    className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View all assignments
                    <ArrowRight size={16} />
                  </Link>
                </section>

                {/* Focus timer */}
                <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <Timer size={19} />
                    </div>
                    <div>
                      <p className="font-bold">Focus Mode</p>
                      <p className="text-xs text-slate-400">
                        Deep work without distractions
                      </p>
                    </div>
                  </div>

                  <div className="py-6 text-center">
                    <p className="text-4xl font-bold tracking-tight">
                      25:00
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Pomodoro session
                    </p>
                  </div>

                  <button className="w-full rounded-xl bg-white py-3 text-sm font-bold text-slate-950 transition hover:bg-indigo-50">
                    Start Timer
                  </button>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
              <p>Last updated today at 3:30 PM</p>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-semibold text-slate-600 hover:text-indigo-600"
              >
                <ArrowLeft size={15} />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function PlannerStat({
  icon,
  label,
  value,
  note,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  );
}



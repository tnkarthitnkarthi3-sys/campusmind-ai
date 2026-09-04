
"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Award,
  Bell,
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
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: CalendarDays,
  },
  {
    label: "Assignments",
    href: "/assignments",
    icon: FileText,
  },
  {
    label: "Study Planner",
    href: "/planner",
    icon: Target,
  },
  {
    label: "Notes",
    href: "/notes",
    icon: NotebookTabs,
  },
  {
    label: "Exams",
    href: "/exams",
    icon: GraduationCap,
  },
];

const stats = [
  {
    title: "Attendance",
    value: "92%",
    subtitle: "Excellent attendance",
    icon: CalendarDays,
    href: "/attendance",
    trend: "+3.2%",
  },
  {
    title: "Assignments",
    value: "8",
    subtitle: "2 due this week",
    icon: FileText,
    href: "/assignments",
    trend: "On track",
  },
  {
    title: "Study Goal",
    value: "78%",
    subtitle: "Weekly target",
    icon: Target,
    href: "/planner",
    trend: "+12%",
  },
  {
    title: "Performance",
    value: "84%",
    subtitle: "Overall average",
    icon: TrendingUp,
    href: "/exams",
    trend: "+5.4%",
  },
];

const upcomingTasks = [
  {
    title: "Database Management System",
    type: "Assignment",
    date: "Today",
    time: "6:00 PM",
    status: "Due soon",
  },
  {
    title: "Computer Networks",
    type: "Study session",
    date: "Tomorrow",
    time: "7:30 AM",
    status: "Planned",
  },
  {
    title: "Operating Systems",
    type: "Internal Exam",
    date: "Sep 8",
    time: "10:00 AM",
    status: "Upcoming",
  },
];

const subjects = [
  {
    name: "Data Structures",
    percentage: 94,
    attendance: "47 / 50",
  },
  {
    name: "Database Management",
    percentage: 90,
    attendance: "45 / 50",
  },
  {
    name: "Computer Networks",
    percentage: 88,
    attendance: "44 / 50",
  },
  {
    name: "Operating Systems",
    percentage: 96,
    attendance: "48 / 50",
  },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
              <BookOpen size={21} />
            </div>

            <div>
              <p className="font-bold tracking-tight">
                CampusMind AI
              </p>
              <p className="text-xs text-slate-400">
                Student Platform
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
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
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10"
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

            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
              <MessageSquareText size={19} className="text-slate-400" />
              AI Study Assistant
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
              <Settings size={19} className="text-slate-400" />
              Settings
            </button>

          </nav>
        </div>

        {/* PROFILE */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <UserRound size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                Karthikeyan
              </p>
              <p className="truncate text-xs text-slate-400">
                Student Account
              </p>
            </div>

            <MoreHorizontal
              size={18}
              className="text-slate-400"
            />

          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="lg:pl-72">

        {/* HEADER */}
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
                  Thursday, September 3, 2026
                </p>

                <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                  Good afternoon, Karthikeyan 👋
                </h1>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50">
                <Bell size={19} />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <div className="hidden h-10 w-px bg-slate-200 sm:block" />

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold">
                    Karthikeyan
                  </p>
                  <p className="text-xs text-slate-400">
                    Computer Science
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                  RK
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">

          {/* AI BANNER */}
          <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">

            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

              <div className="max-w-2xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles size={14} className="text-cyan-300" />
                  CampusMind AI Insight
                </div>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  You&apos;re having a strong academic week.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  Your attendance and study consistency are improving.
                  Focus on the two assignments due this week to stay on
                  track with your goals.
                </p>

              </div>

              <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-50">
                Open AI Assistant
                <ArrowUpRight size={17} />
              </button>

            </div>
          </section>

          {/* STATS */}
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
                      {stat.trend}
                    </span>

                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <div className="mt-1 flex items-end justify-between">

                    <div>
                      <p className="text-3xl font-bold tracking-tight">
                        {stat.value}
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

          {/* TWO COLUMN */}
          <section className="mt-7 grid gap-7 xl:grid-cols-[1.4fr_0.8fr]">

            {/* ATTENDANCE */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                <div>
                  <h3 className="font-bold">
                    Attendance Overview
                  </h3>

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

                    <div className="absolute inset-2 rounded-full border-[9px] border-indigo-500 border-r-slate-200 border-b-slate-200" />

                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        92%
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Overall
                      </p>
                    </div>

                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={17}
                        className="text-emerald-500"
                      />
                      <p className="text-sm font-bold">
                        Excellent attendance
                      </p>
                    </div>

                    <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
                      Keep attending regularly to maintain your
                      eligibility for semester examinations.
                    </p>
                  </div>

                </div>

                <div className="space-y-5">

                  {subjects.map((subject) => (
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
                          style={{
                            width: `${subject.percentage}%`,
                          }}
                        />
                      </div>

                    </div>
                  ))}

                </div>

              </div>
            </div>

            {/* WEEKLY GOAL */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="font-bold">
                  Weekly Study Goal
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Your progress this week
                </p>
              </div>

              <div className="p-6">

                <div className="flex items-center justify-center py-3">

                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-slate-100">

                    <div className="absolute inset-3 rounded-full border-[15px] border-indigo-500 border-r-cyan-400 border-b-slate-200 border-l-slate-200" />

                    <div className="text-center">
                      <p className="text-4xl font-bold">
                        78%
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        15.6 / 20 hours
                      </p>
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
                        4.4 hours remaining
                      </p>

                      <p className="text-xs text-slate-400">
                        Keep going — you&apos;re almost there.
                      </p>
                    </div>
                  </div>

                </div>

                <Link
                  href="/planner"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Open Study Planner
                  <ArrowRightIcon />
                </Link>

              </div>
            </div>

          </section>

          {/* LOWER SECTION */}
          <section className="mt-7 grid gap-7 xl:grid-cols-[1.4fr_0.8fr]">

            {/* UPCOMING */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                <div>
                  <h3 className="font-bold">
                    Upcoming
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Important academic activities
                  </p>
                </div>

                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                  <MoreHorizontal size={19} />
                </button>

              </div>

              <div className="divide-y divide-slate-100">

                {upcomingTasks.map((task, index) => (
                  <div
                    key={task.title}
                    className="flex items-center gap-4 px-6 py-5"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      {index === 0 ? (
                        <FileText size={19} />
                      ) : index === 1 ? (
                        <BookOpen size={19} />
                      ) : (
                        <GraduationCap size={19} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-bold">
                        {task.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{task.type}</span>
                        <span>•</span>
                        <span>{task.date}</span>
                        <span>•</span>
                        <span>{task.time}</span>
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

              </div>

            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">

                <h3 className="font-bold">
                  Quick Actions
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Jump into your frequently used tools
                </p>

              </div>

              <div className="grid grid-cols-2 gap-3 p-5">

                <Link
                  href="/assignments"
                  className="group rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <FileText
                    size={21}
                    className="text-indigo-600"
                  />

                  <p className="mt-4 text-sm font-bold">
                    Assignments
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    View tasks
                  </p>
                </Link>

                <Link
                  href="/notes"
                  className="group rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-200 hover:bg-cyan-50"
                >
                  <NotebookTabs
                    size={21}
                    className="text-cyan-600"
                  />

                  <p className="mt-4 text-sm font-bold">
                    Notes
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Study materials
                  </p>
                </Link>

                <Link
                  href="/exams"
                  className="group rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <Award
                    size={21}
                    className="text-emerald-600"
                  />

                  <p className="mt-4 text-sm font-bold">
                    Exams
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Exam schedule
                  </p>
                </Link>

                <button className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50">
                  <MessageSquareText
                    size={21}
                    className="text-violet-600"
                  />

                  <p className="mt-4 text-sm font-bold">
                    AI Assistant
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Ask anything
                  </p>
                </button>

              </div>

            </div>

          </section>

          {/* FOOTER STATUS */}
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
                  Your academic data is up to date.
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              All systems normal
            </div>

          </section>

        </main>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return <ArrowUpRight size={17} />;
}
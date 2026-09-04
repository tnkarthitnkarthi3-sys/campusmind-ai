
"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  TrendingUp,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const subjects = [
  {
    name: "Data Structures",
    code: "CS301",
    faculty: "Dr. Arun Kumar",
    present: 47,
    total: 50,
    percentage: 94,
    status: "Excellent",
  },
  {
    name: "Database Management",
    code: "CS302",
    faculty: "Prof. Priya",
    present: 45,
    total: 50,
    percentage: 90,
    status: "Good",
  },
  {
    name: "Computer Networks",
    code: "CS303",
    faculty: "Dr. Suresh",
    present: 44,
    total: 50,
    percentage: 88,
    status: "Good",
  },
  {
    name: "Operating Systems",
    code: "CS304",
    faculty: "Prof. Meena",
    present: 48,
    total: 50,
    percentage: 96,
    status: "Excellent",
  },
  {
    name: "Software Engineering",
    code: "CS305",
    faculty: "Dr. Rajesh",
    present: 43,
    total: 50,
    percentage: 86,
    status: "Needs attention",
  },
  {
    name: "Artificial Intelligence",
    code: "CS306",
    faculty: "Prof. Kavitha",
    present: 46,
    total: 50,
    percentage: 92,
    status: "Excellent",
  },
];

const recentAttendance = [
  {
    subject: "Data Structures",
    date: "Sep 03, 2026",
    time: "09:00 AM",
    status: "Present",
  },
  {
    subject: "Database Management",
    date: "Sep 03, 2026",
    time: "11:00 AM",
    status: "Present",
  },
  {
    subject: "Computer Networks",
    date: "Sep 02, 2026",
    time: "10:00 AM",
    status: "Absent",
  },
  {
    subject: "Operating Systems",
    date: "Sep 02, 2026",
    time: "02:00 PM",
    status: "Present",
  },
  {
    subject: "Software Engineering",
    date: "Sep 01, 2026",
    time: "09:00 AM",
    status: "Present",
  },
];

export default function AttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("Semester 5");

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
      icon: Clock3,
    },
    {
      label: "Notes",
      href: "/notes",
      icon: BookOpen,
    },
  ];

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
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
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

        <div className="flex-1 px-4 py-6">

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.label === "Attendance";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    size={19}
                    className={
                      active
                        ? "text-cyan-300"
                        : "text-slate-400"
                    }
                  />

                  {item.label}
                </Link>
              );
            })}

          </nav>

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Account
          </p>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            <UserRound size={19} className="text-slate-400" />
            Profile
          </button>

        </div>

        <div className="border-t border-slate-100 p-4">

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <UserRound size={19} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                Karthikeyan
              </p>

              <p className="truncate text-xs text-slate-400">
                Computer Science
              </p>
            </div>

          </div>

        </div>
      </aside>

      {/* MAIN */}
      <div className="lg:pl-72">

        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">

          <div className="flex h-20 items-center justify-between px-5 sm:px-8 lg:px-10">

            <div className="flex items-center gap-4">

              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Link
                    href="/dashboard"
                    className="hover:text-slate-700"
                  >
                    Dashboard
                  </Link>

                  <span>/</span>

                  <span>Attendance</span>
                </div>

                <h1 className="mt-1 text-xl font-bold tracking-tight">
                  Attendance
                </h1>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="relative hidden sm:block">
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold outline-none focus:border-indigo-500"
                >
                  <option>Semester 5</option>
                  <option>Semester 4</option>
                  <option>Semester 3</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white">
                RK
              </div>

            </div>

          </div>
        </header>

        {/* CONTENT */}
        <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">

          {/* PAGE INTRO */}
          <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                <CalendarDays size={14} />
                {semester}
              </div>

              <h2 className="text-3xl font-bold tracking-tight">
                Your attendance overview
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track your class attendance, identify subjects that
                need attention, and stay above the required attendance
                percentage.
              </p>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-indigo-700">
              <TrendingUp size={17} />
              Attendance Report
            </button>

          </section>

          {/* SUMMARY CARDS */}
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* OVERALL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Activity size={20} />
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                  +2.4%
                </span>

              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Overall Attendance
              </p>

              <p className="mt-1 text-3xl font-bold">
                92%
              </p>

              <p className="mt-1 text-xs text-slate-400">
                273 of 300 classes attended
              </p>

            </div>

            {/* PRESENT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Classes Present
              </p>

              <p className="mt-1 text-3xl font-bold">
                273
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Attendance recorded
              </p>

            </div>

            {/* ABSENT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircle size={20} />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Classes Absent
              </p>

              <p className="mt-1 text-3xl font-bold">
                27
              </p>

              <p className="mt-1 text-xs text-slate-400">
                9% of total classes
              </p>

            </div>

            {/* REQUIRED */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <TargetIcon />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Required Minimum
              </p>

              <p className="mt-1 text-3xl font-bold">
                75%
              </p>

              <p className="mt-1 text-xs font-semibold text-emerald-600">
                You are 17% above minimum
              </p>

            </div>

          </section>

          {/* ATTENDANCE HEALTH */}
          <section className="mt-7 grid gap-7 xl:grid-cols-[1.3fr_0.7fr]">

            {/* SUBJECT TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                <div>
                  <h3 className="font-bold">
                    Subject Attendance
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Detailed attendance for each subject
                  </p>
                </div>

                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                  <MoreHorizontal size={19} />
                </button>

              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead className="bg-slate-50">

                    <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-400">

                      <th className="px-6 py-4">
                        Subject
                      </th>

                      <th className="px-4 py-4">
                        Faculty
                      </th>

                      <th className="px-4 py-4">
                        Classes
                      </th>

                      <th className="px-4 py-4">
                        Attendance
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {subjects.map((subject) => (

                      <tr
                        key={subject.code}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-5">

                          <div>
                            <p className="text-sm font-bold">
                              {subject.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {subject.code}
                            </p>
                          </div>

                        </td>

                        <td className="px-4 py-5">
                          <p className="text-sm text-slate-600">
                            {subject.faculty}
                          </p>
                        </td>

                        <td className="px-4 py-5">

                          <p className="text-sm font-semibold">
                            {subject.present} / {subject.total}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Present
                          </p>

                        </td>

                        <td className="min-w-[180px] px-4 py-5">

                          <div className="flex items-center gap-3">

                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${
                                  subject.percentage >= 90
                                    ? "bg-emerald-500"
                                    : subject.percentage >= 75
                                      ? "bg-indigo-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${subject.percentage}%`,
                                }}
                              />
                            </div>

                            <span className="text-sm font-bold">
                              {subject.percentage}%
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                              subject.status === "Excellent"
                                ? "bg-emerald-50 text-emerald-600"
                                : subject.status === "Good"
                                  ? "bg-indigo-50 text-indigo-600"
                                  : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {subject.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* MOBILE CARDS */}
              <div className="divide-y divide-slate-100 md:hidden">

                {subjects.map((subject) => (

                  <div
                    key={subject.code}
                    className="p-5"
                  >

                    <div className="flex items-start justify-between">

                      <div>
                        <p className="font-bold">
                          {subject.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {subject.code} • {subject.faculty}
                        </p>
                      </div>

                      <span className="text-lg font-bold">
                        {subject.percentage}%
                      </span>

                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className={`h-full rounded-full ${
                          subject.percentage >= 90
                            ? "bg-emerald-500"
                            : subject.percentage >= 75
                              ? "bg-indigo-500"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${subject.percentage}%`,
                        }}
                      />

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <p className="text-xs text-slate-400">
                        {subject.present} / {subject.total} classes
                      </p>

                      <span className="text-xs font-bold text-slate-500">
                        {subject.status}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* ATTENDANCE HEALTH */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">

                <h3 className="font-bold">
                  Attendance Health
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Your current academic standing
                </p>

              </div>

              <div className="p-6">

                <div className="flex justify-center py-4">

                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-slate-100">

                    <div className="absolute inset-3 rounded-full border-[15px] border-emerald-500 border-r-emerald-400 border-b-slate-200 border-l-slate-200" />

                    <div className="text-center">
                      <p className="text-4xl font-bold">
                        92%
                      </p>

                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Excellent
                      </p>
                    </div>

                  </div>

                </div>

                <div className="mt-5 space-y-3">

                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">

                    <div className="flex items-center gap-3">

                      <CheckCircle2
                        size={18}
                        className="text-emerald-600"
                      />

                      <span className="text-sm font-semibold text-emerald-900">
                        Above 90%
                      </span>

                    </div>

                    <span className="text-xs font-bold text-emerald-600">
                      4 subjects
                    </span>

                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-4">

                    <div className="flex items-center gap-3">

                      <TrendingUp
                        size={18}
                        className="text-indigo-600"
                      />

                      <span className="text-sm font-semibold text-indigo-900">
                        75% - 90%
                      </span>

                    </div>

                    <span className="text-xs font-bold text-indigo-600">
                      1 subject
                    </span>

                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">

                    <div className="flex items-center gap-3">

                      <XCircle
                        size={18}
                        className="text-red-600"
                      />

                      <span className="text-sm font-semibold text-red-900">
                        Below 75%
                      </span>

                    </div>

                    <span className="text-xs font-bold text-red-600">
                      0 subjects
                    </span>

                  </div>

                </div>

                <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">

                  <p className="text-sm font-bold text-indigo-950">
                    AI Recommendation
                  </p>

                  <p className="mt-2 text-xs leading-5 text-indigo-700">
                    Your attendance is healthy. Continue attending
                    regularly and maintain your current consistency.
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* RECENT ATTENDANCE */}
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h3 className="font-bold">
                  Recent Attendance
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Latest attendance records
                </p>
              </div>

              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                View all
                <ArrowUpRight size={14} />
              </button>

            </div>

            <div className="divide-y divide-slate-100">

              {recentAttendance.map((record) => (

                <div
                  key={`${record.subject}-${record.date}-${record.time}`}
                  className="flex items-center gap-4 px-6 py-4"
                >

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      record.status === "Present"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {record.status === "Present" ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <XCircle size={18} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-bold">
                      {record.subject}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {record.date} • {record.time}
                    </p>

                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      record.status === "Present"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {record.status}
                  </span>

                </div>

              ))}

            </div>

          </section>

          {/* FOOTER */}
          <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 sm:flex-row">

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock3 size={15} />
              Last updated today at 3:20 PM
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

          </div>

        </main>
      </div>
    </div>
  );
}

function TargetIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
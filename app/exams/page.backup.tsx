

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  NotebookPen,
  Sparkles,
  Target,
  Timer,
  X,
} from "lucide-react";

const exams = [
  {
    subject: "Operating Systems",
    code: "CS304",
    title: "Internal Assessment - I",
    date: "Sep 08, 2026",
    time: "10:00 AM - 12:00 PM",
    room: "Block A • Room 204",
    type: "Internal",
    marks: 50,
    preparation: 72,
    status: "Upcoming",
    priority: "High",
  },
  {
    subject: "Database Management",
    code: "CS302",
    title: "Internal Assessment - I",
    date: "Sep 10, 2026",
    time: "10:00 AM - 12:00 PM",
    room: "Block B • Room 105",
    type: "Internal",
    marks: 50,
    preparation: 64,
    status: "Upcoming",
    priority: "High",
  },
  {
    subject: "Computer Networks",
    code: "CS303",
    title: "Model Examination",
    date: "Sep 13, 2026",
    time: "02:00 PM - 04:00 PM",
    room: "Block A • Room 301",
    type: "Model",
    marks: 75,
    preparation: 48,
    status: "Upcoming",
    priority: "Medium",
  },
  {
    subject: "Data Structures",
    code: "CS301",
    title: "Internal Assessment - I",
    date: "Sep 15, 2026",
    time: "10:00 AM - 12:00 PM",
    room: "Block C • Room 102",
    type: "Internal",
    marks: 50,
    preparation: 81,
    status: "Upcoming",
    priority: "Medium",
  },
  {
    subject: "Software Engineering",
    code: "CS305",
    title: "Internal Assessment - I",
    date: "Sep 17, 2026",
    time: "02:00 PM - 04:00 PM",
    room: "Block B • Room 201",
    type: "Internal",
    marks: 50,
    preparation: 56,
    status: "Upcoming",
    priority: "Medium",
  },
  {
    subject: "Artificial Intelligence",
    code: "CS306",
    title: "Model Examination",
    date: "Sep 20, 2026",
    time: "10:00 AM - 01:00 PM",
    room: "Block A • Room 401",
    type: "Model",
    marks: 100,
    preparation: 42,
    status: "Upcoming",
    priority: "Low",
  },
];

const completed = [
  {
    subject: "Data Structures",
    title: "Internal Assessment - I",
    date: "Aug 18, 2026",
    marks: "43 / 50",
    percentage: "86%",
  },
  {
    subject: "Computer Networks",
    title: "Class Test",
    date: "Aug 12, 2026",
    marks: "42 / 50",
    percentage: "84%",
  },
];

export default function ExamsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const filteredExams =
    filter === "All"
      ? exams
      : exams.filter((exam) => exam.type === filter);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
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
                  icon={<FileText size={18} />}
                  label="Assignments"
                />

                <SidebarLink
                  href="/planner"
                  icon={<CalendarDays size={18} />}
                  label="Study Planner"
                />

                <SidebarLink
                  href="/notes"
                  icon={<NotebookPen size={18} />}
                  label="Notes"
                />

                <SidebarLink
                  href="/exams"
                  icon={<GraduationCap size={18} />}
                  label="Exams"
                  active
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
                  <p className="truncate text-sm font-semibold">
                    Karthikeyan
                  </p>
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
                    <span className="text-slate-700">Exams</span>
                  </div>

                  <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                    Exams
                  </h1>
                </div>
              </div>

              <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex">
                <CalendarDays size={17} />
                Exam Calendar
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
            {/* Intro */}
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                <GraduationCap size={14} />
                Academic Assessments
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Exam schedule
              </h2>

              <p className="mt-2 max-w-2xl text-slate-500">
                Track upcoming examinations, preparation progress and previous
                results from one place.
              </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ExamStat
                icon={<CalendarDays size={20} />}
                label="Upcoming Exams"
                value="6"
                note="This semester"
                iconClass="bg-blue-50 text-blue-600"
              />

              <ExamStat
                icon={<Clock3 size={20} />}
                label="Next Exam"
                value="5 days"
                note="Operating Systems"
                iconClass="bg-red-50 text-red-600"
              />

              <ExamStat
                icon={<Target size={20} />}
                label="Avg Preparation"
                value="61%"
                note="Across upcoming exams"
                iconClass="bg-indigo-50 text-indigo-600"
              />

              <ExamStat
                icon={<CheckCircle2 size={20} />}
                label="Completed"
                value="2"
                note="Assessments completed"
                iconClass="bg-emerald-50 text-emerald-600"
              />
            </div>

            {/* Next Exam Banner */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-slate-950 text-white">
              <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <Bell size={15} />
                    Next Examination
                  </div>

                  <h3 className="text-2xl font-bold">
                    Operating Systems
                  </h3>

                  <p className="mt-1 text-slate-400">
                    Internal Assessment - I • CS304
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
                      <CalendarDays size={15} />
                      Sep 08, 2026
                    </span>

                    <span className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
                      <Clock3 size={15} />
                      10:00 AM - 12:00 PM
                    </span>

                    <span className="rounded-lg bg-white/10 px-3 py-2 text-sm">
                      Room 204
                    </span>
                  </div>
                </div>

                <div className="min-w-48 rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-semibold text-slate-400">
                    Preparation
                  </p>

                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-3xl font-bold">72%</span>
                    <span className="text-xs text-emerald-400">
                      Good progress
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[72%] rounded-full bg-cyan-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Exam List */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold">Upcoming examinations</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {filteredExams.length} examinations scheduled
                  </p>
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1">
                  {["All", "Internal", "Model"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setFilter(item)}
                      className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                        filter === item
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredExams.map((exam, index) => (
                  <div
                    key={exam.subject}
                    className="group rounded-2xl border border-slate-100 p-5 transition hover:border-indigo-100 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <div className="flex items-center gap-4 lg:w-[330px]">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                          {index + 1}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                              {exam.code}
                            </span>

                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                                exam.priority === "High"
                                  ? "bg-red-50 text-red-600"
                                  : exam.priority === "Medium"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {exam.priority} Priority
                            </span>
                          </div>

                          <h4 className="mt-2 font-bold">{exam.subject}</h4>

                          <p className="mt-1 text-xs text-slate-400">
                            {exam.title}
                          </p>
                        </div>
                      </div>

                      <div className="grid flex-1 gap-4 sm:grid-cols-3">
                        <ExamDetail
                          icon={<CalendarDays size={16} />}
                          label="Date"
                          value={exam.date}
                        />

                        <ExamDetail
                          icon={<Clock3 size={16} />}
                          label="Time"
                          value={exam.time}
                        />

                        <ExamDetail
                          icon={<BookOpen size={16} />}
                          label="Venue"
                          value={exam.room}
                        />
                      </div>

                      <div className="w-full lg:w-44">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">
                            Preparation
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {exam.preparation}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              exam.preparation >= 70
                                ? "bg-emerald-500"
                                : exam.preparation >= 50
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${exam.preparation}%` }}
                          />
                        </div>

                        <p className="mt-2 text-[11px] text-slate-400">
                          {exam.marks} marks
                        </p>
                      </div>

                      <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 lg:w-auto">
                        Details
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Two columns */}
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {/* Preparation */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Preparation overview</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Subjects that need more revision
                    </p>
                  </div>

                  <Sparkles size={20} className="text-indigo-500" />
                </div>

                <div className="space-y-5">
                  {exams.slice(0, 4).map((exam) => (
                    <div key={exam.code}>
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            {exam.subject}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {exam.date}
                          </p>
                        </div>

                        <span className="text-sm font-bold">
                          {exam.preparation}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            exam.preparation >= 70
                              ? "bg-emerald-500"
                              : exam.preparation >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${exam.preparation}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Results */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Recent results</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Your latest assessments
                    </p>
                  </div>

                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>

                <div className="space-y-3">
                  {completed.map((result) => (
                    <div
                      key={result.subject}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                    >
                      <div>
                        <p className="text-sm font-bold">
                          {result.subject}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {result.title} • {result.date}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {result.marks}
                        </p>
                        <p className="text-xs font-semibold text-emerald-600">
                          {result.percentage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  View all results
                  <ArrowRight size={15} />
                </button>
              </section>
            </div>

            {/* AI Recommendation */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50">
              <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <Sparkles size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      AI Exam Coach
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                      Start revising Operating Systems today.
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      Your next exam is in 5 days. Focus on CPU scheduling,
                      process synchronization and memory management first.
                    </p>
                  </div>
                </div>

                <Link
                  href="/planner"
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Plan Revision
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            {/* Focus */}
            <section className="mt-8 rounded-2xl bg-slate-950 p-6 text-white">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Timer size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold">Exam preparation mode</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Use focused study sessions to improve your preparation
                      score.
                    </p>
                  </div>
                </div>

                <Link
                  href="/planner"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-indigo-50"
                >
                  Open Study Planner
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
              <p>Last updated today at 3:40 PM</p>

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

function ExamStat({
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
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function ExamDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}


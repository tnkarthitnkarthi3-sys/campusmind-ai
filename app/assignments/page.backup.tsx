"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type AssignmentStatus = "Pending" | "Submitted" | "Completed";

type Assignment = {
  id: number;
  title: string;
  subject: string;
  code: string;
  description: string;
  dueDate: string;
  dueTime: string;
  status: AssignmentStatus;
  priority: "High" | "Medium" | "Low";
  progress: number;
  points: number;
};

const assignments: Assignment[] = [
  {
    id: 1,
    title: "Database Normalization Report",
    subject: "Database Management",
    code: "CS302",
    description:
      "Prepare a detailed report covering 1NF, 2NF, 3NF and BCNF with suitable examples.",
    dueDate: "Sep 04, 2026",
    dueTime: "06:00 PM",
    status: "Pending",
    priority: "High",
    progress: 65,
    points: 20,
  },
  {
    id: 2,
    title: "Network Topology Analysis",
    subject: "Computer Networks",
    code: "CS303",
    description:
      "Analyze different network topologies and compare their performance, cost and scalability.",
    dueDate: "Sep 06, 2026",
    dueTime: "11:59 PM",
    status: "Pending",
    priority: "Medium",
    progress: 35,
    points: 15,
  },
  {
    id: 3,
    title: "Process Scheduling Algorithms",
    subject: "Operating Systems",
    code: "CS304",
    description:
      "Implement and compare FCFS, SJF, Priority and Round Robin scheduling algorithms.",
    dueDate: "Sep 08, 2026",
    dueTime: "05:00 PM",
    status: "Pending",
    priority: "Medium",
    progress: 20,
    points: 25,
  },
  {
    id: 4,
    title: "Binary Search Tree Implementation",
    subject: "Data Structures",
    code: "CS301",
    description:
      "Implement insertion, deletion, searching and traversal operations for a binary search tree.",
    dueDate: "Sep 02, 2026",
    dueTime: "05:00 PM",
    status: "Submitted",
    priority: "High",
    progress: 100,
    points: 20,
  },
  {
    id: 5,
    title: "Software Development Models",
    subject: "Software Engineering",
    code: "CS305",
    description:
      "Create a comparative study of Waterfall, Agile, Spiral and V-Model methodologies.",
    dueDate: "Aug 30, 2026",
    dueTime: "11:59 PM",
    status: "Completed",
    priority: "Low",
    progress: 100,
    points: 10,
  },
  {
    id: 6,
    title: "Introduction to Neural Networks",
    subject: "Artificial Intelligence",
    code: "CS306",
    description:
      "Explain the architecture and working principles of artificial neural networks.",
    dueDate: "Aug 28, 2026",
    dueTime: "06:00 PM",
    status: "Completed",
    priority: "Medium",
    progress: 100,
    points: 15,
  },
];

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
    icon: BookOpen,
  },
  {
    label: "Exams",
    href: "/exams",
    icon: FileCheck2,
  },
];

export default function AssignmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "All" | AssignmentStatus
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesStatus =
        activeFilter === "All" ||
        assignment.status === activeFilter;

      const matchesSubject =
        subjectFilter === "All Subjects" ||
        assignment.subject === subjectFilter;

      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        assignment.title.toLowerCase().includes(query) ||
        assignment.subject.toLowerCase().includes(query) ||
        assignment.code.toLowerCase().includes(query);

      return matchesStatus && matchesSubject && matchesSearch;
    });
  }, [activeFilter, searchQuery, subjectFilter]);

  const pendingCount = assignments.filter(
    (item) => item.status === "Pending",
  ).length;

  const submittedCount = assignments.filter(
    (item) => item.status === "Submitted",
  ).length;

  const completedCount = assignments.filter(
    (item) => item.status === "Completed",
  ).length;

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

        <div className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.label === "Assignments";

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

                  <span>Assignments</span>
                </div>

                <h1 className="mt-1 text-xl font-bold tracking-tight">
                  Assignments
                </h1>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <button className="hidden items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 sm:flex">
                <Plus size={17} />
                Add Assignment
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white">
                RK
              </div>

            </div>

          </div>
        </header>

        {/* CONTENT */}
        <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">

          {/* HERO */}
          <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                <FileText size={14} />
                Academic Tasks
              </div>

              <h2 className="text-3xl font-bold tracking-tight">
                Manage your assignments
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Stay organized, track your progress, and never miss
                an academic deadline.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-indigo-700 sm:hidden">
              <Plus size={17} />
              Add Assignment
            </button>

          </section>

          {/* STATS */}
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<FileText size={20} />}
              title="Total Assignments"
              value={String(assignments.length)}
              subtitle="This semester"
              iconClass="bg-indigo-50 text-indigo-600"
            />

            <StatCard
              icon={<Clock3 size={20} />}
              title="Pending"
              value={String(pendingCount)}
              subtitle="Need your attention"
              iconClass="bg-amber-50 text-amber-600"
              valueClass="text-amber-600"
            />

            <StatCard
              icon={<Paperclip size={20} />}
              title="Submitted"
              value={String(submittedCount)}
              subtitle="Awaiting evaluation"
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              icon={<CheckCircle2 size={20} />}
              title="Completed"
              value={String(completedCount)}
              subtitle="Successfully finished"
              iconClass="bg-emerald-50 text-emerald-600"
              valueClass="text-emerald-600"
            />

          </section>

          {/* PROGRESS BANNER */}
          <section className="mt-7 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">

            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

              <div className="max-w-2xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  <Target size={14} className="text-cyan-300" />
                  Assignment Progress
                </div>

                <h3 className="text-2xl font-bold">
                  You&apos;re making good progress.
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  4 of your 6 assignments have been submitted or
                  completed. Focus on the upcoming Database Management
                  assignment first.
                </p>

              </div>

              <div className="min-w-[220px]">

                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">
                    Overall completion
                  </span>

                  <span className="font-bold text-cyan-300">
                    67%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: "67%" }}
                  />

                </div>

                <p className="mt-2 text-right text-xs text-slate-500">
                  4 / 6 completed or submitted
                </p>

              </div>

            </div>

          </section>

          {/* FILTERS */}
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              {/* SEARCH */}
              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search assignments..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                {/* SUBJECT */}
                <div className="relative">

                  <select
                    value={subjectFilter}
                    onChange={(event) =>
                      setSubjectFilter(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-semibold outline-none focus:border-indigo-500 sm:w-52"
                  >
                    <option>All Subjects</option>
                    <option>Database Management</option>
                    <option>Computer Networks</option>
                    <option>Operating Systems</option>
                    <option>Data Structures</option>
                    <option>Software Engineering</option>
                    <option>Artificial Intelligence</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                </div>

                {/* STATUS */}
                <div className="flex rounded-xl bg-slate-100 p-1">

                  {(
                    ["All", "Pending", "Submitted", "Completed"] as const
                  ).map((filter) => (

                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                        activeFilter === filter
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {filter}
                    </button>

                  ))}

                </div>

              </div>

            </div>

          </section>

          {/* ASSIGNMENT LIST */}
          <section className="mt-7">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h3 className="font-bold">
                  Your assignments
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {filteredAssignments.length} assignment
                  {filteredAssignments.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <button className="hidden items-center gap-2 rounded-lg p-2 text-slate-400 hover:bg-white sm:flex">
                <MoreHorizontal size={19} />
              </button>

            </div>

            {filteredAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={23} />
                </div>

                <h3 className="mt-4 font-bold">
                  No assignments found
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Try changing your search or filters.
                </p>

              </div>
            ) : (
              <div className="grid gap-4">

                {filteredAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                  />
                ))}

              </div>
            )}

          </section>

          {/* DEADLINE REMINDER */}
          <section className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Clock3 size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-amber-950">
                    Upcoming deadline
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Database Normalization Report is due tomorrow
                    at 6:00 PM. You&apos;re currently 65% complete.
                  </p>
                </div>

              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-700">
                Continue Assignment
                <ArrowUpRight size={15} />
              </button>

            </div>

          </section>

          {/* FOOTER */}
          <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 sm:flex-row">

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock3 size={15} />
              Last updated today at 3:25 PM
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

function StatCard({
  icon,
  title,
  value,
  subtitle,
  iconClass,
  valueClass = "",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className={`mt-1 text-3xl font-bold ${valueClass}`}>
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}

function AssignmentCard({
  assignment,
}: {
  assignment: Assignment;
}) {
  const priorityClass =
    assignment.priority === "High"
      ? "bg-red-50 text-red-600"
      : assignment.priority === "Medium"
        ? "bg-amber-50 text-amber-600"
        : "bg-slate-100 text-slate-500";

  const statusClass =
    assignment.status === "Completed"
      ? "bg-emerald-50 text-emerald-600"
      : assignment.status === "Submitted"
        ? "bg-indigo-50 text-indigo-600"
        : "bg-amber-50 text-amber-600";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-6">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

        {/* ICON */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {assignment.status === "Completed" ? (
            <CheckCircle2 size={21} />
          ) : (
            <FileText size={21} />
          )}
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {assignment.code}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${priorityClass}`}
            >
              {assignment.priority} Priority
            </span>

          </div>

          <h4 className="mt-3 text-base font-bold sm:text-lg">
            {assignment.title}
          </h4>

          <p className="mt-1 text-sm font-semibold text-indigo-600">
            {assignment.subject}
          </p>

          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
            {assignment.description}
          </p>

        </div>

        {/* PROGRESS */}
        <div className="w-full lg:w-52">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs font-semibold text-slate-400">
              Progress
            </span>

            <span className="text-xs font-bold">
              {assignment.progress}%
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className={`h-full rounded-full ${
                assignment.status === "Completed"
                  ? "bg-emerald-500"
                  : assignment.progress >= 60
                    ? "bg-indigo-500"
                    : "bg-amber-500"
              }`}
              style={{
                width: `${assignment.progress}%`,
              }}
            />

          </div>

          <p className="mt-2 text-xs text-slate-400">
            {assignment.points} marks
          </p>

        </div>

        {/* DUE DATE */}
        <div className="lg:w-36">

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Due date
          </p>

          <p className="mt-1 text-sm font-bold">
            {assignment.dueDate}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {assignment.dueTime}
          </p>

        </div>

        {/* STATUS */}
        <div className="flex items-center justify-between gap-3 lg:w-32 lg:flex-col lg:items-end">

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusClass}`}
          >
            {assignment.status}
          </span>

          <button
            aria-label={`Open ${assignment.title}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowUpRight size={16} />
          </button>

        </div>

      </div>

    </article>
  );
}

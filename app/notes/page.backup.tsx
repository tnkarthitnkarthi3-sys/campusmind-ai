
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronDown,
  FileText,
  Folder,
  LayoutDashboard,
  Menu,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
  Star,
  Tag,
  X,
  Trash2,
  Edit3,
} from "lucide-react";

const notes = [
  {
    id: 1,
    title: "Database Normalization",
    subject: "Database Management",
    code: "CS302",
    content:
      "1NF, 2NF, 3NF and BCNF with examples, functional dependencies and decomposition.",
    tags: ["DBMS", "Important"],
    date: "Sep 03, 2026",
    favorite: true,
  },
  {
    id: 2,
    title: "OSI Model & TCP/IP",
    subject: "Computer Networks",
    code: "CS303",
    content:
      "Seven layers of OSI model, TCP/IP architecture, protocols and comparison.",
    tags: ["Networks", "Revision"],
    date: "Sep 02, 2026",
    favorite: true,
  },
  {
    id: 3,
    title: "Process Scheduling",
    subject: "Operating Systems",
    code: "CS304",
    content:
      "FCFS, SJF, Priority Scheduling and Round Robin algorithms with examples.",
    tags: ["OS", "Algorithms"],
    date: "Sep 01, 2026",
    favorite: false,
  },
  {
    id: 4,
    title: "Binary Search Trees",
    subject: "Data Structures",
    code: "CS301",
    content:
      "BST insertion, deletion, searching, inorder, preorder and postorder traversal.",
    tags: ["DS", "Exam"],
    date: "Aug 30, 2026",
    favorite: true,
  },
  {
    id: 5,
    title: "Software Development Models",
    subject: "Software Engineering",
    code: "CS305",
    content:
      "Waterfall, Agile, Spiral and V-Model methodology comparison and use cases.",
    tags: ["SE", "Theory"],
    date: "Aug 28, 2026",
    favorite: false,
  },
  {
    id: 6,
    title: "Artificial Neural Networks",
    subject: "Artificial Intelligence",
    code: "CS306",
    content:
      "Neurons, activation functions, layers, forward propagation and basic learning.",
    tags: ["AI", "Important"],
    date: "Aug 27, 2026",
    favorite: true,
  },
];

const subjects = [
  "All Subjects",
  "Database Management",
  "Computer Networks",
  "Operating Systems",
  "Data Structures",
  "Software Engineering",
  "Artificial Intelligence",
];

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.subject.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase());

      const matchesSubject =
        subject === "All Subjects" || note.subject === subject;

      const matchesFavorite = !favoritesOnly || note.favorite;

      return matchesSearch && matchesSubject && matchesFavorite;
    });
  }, [search, subject, favoritesOnly]);

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
                  icon={<CalendarDays size={18} />}
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
                  active
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
                  icon={<Brain size={18} />}
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
                    <span className="text-slate-700">Notes</span>
                  </div>

                  <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                    Notes
                  </h1>
                </div>
              </div>

              <button className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                <Plus size={17} />
                <span className="hidden sm:inline">Add Note</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
            {/* Intro */}
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                <NotebookPen size={14} />
                Academic Knowledge Base
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your study notes
              </h2>

              <p className="mt-2 max-w-2xl text-slate-500">
                Keep your important concepts, revision material and class
                notes organized in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <NoteStat
                icon={<FileText size={20} />}
                label="Total Notes"
                value="24"
                note="This semester"
                iconClass="bg-blue-50 text-blue-600"
              />

              <NoteStat
                icon={<Folder size={20} />}
                label="Subjects"
                value="6"
                note="All subjects covered"
                iconClass="bg-indigo-50 text-indigo-600"
              />

              <NoteStat
                icon={<Star size={20} />}
                label="Favorites"
                value="9"
                note="Important notes"
                iconClass="bg-amber-50 text-amber-600"
              />

              <NoteStat
                icon={<Sparkles size={20} />}
                label="AI Ready"
                value="18"
                note="Notes available for AI Q&A"
                iconClass="bg-purple-50 text-purple-600"
              />
            </div>

            {/* AI Banner */}
            <div className="mb-8 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <Sparkles size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      AI Notes Assistant
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                      Ask questions from your notes.
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      CampusMind AI can summarize your notes, explain difficult
                      concepts and generate revision questions.
                    </p>
                  </div>
                </div>

                <Link
                  href="/ai-assistant"
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Open AI Assistant
                </Link>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search notes, subjects or concepts..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="relative">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-indigo-500 lg:w-64"
                  >
                    {subjects.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <button
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    favoritesOnly
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Star size={17} />
                  Favorites
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Your notes</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {filteredNotes.length} notes found
                </p>
              </div>

              <button className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex">
                Recently updated
                <ChevronDown size={15} />
              </button>
            </div>

            {/* Notes Grid */}
            {filteredNotes.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredNotes.map((note) => (
                  <article
                    key={note.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FileText size={20} />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          aria-label="Edit note"
                          className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-50 hover:text-slate-700"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          aria-label="Favorite note"
                          className={`rounded-lg p-2 transition ${
                            note.favorite
                              ? "text-amber-500"
                              : "text-slate-300 hover:text-amber-500"
                          }`}
                        >
                          <Star
                            size={17}
                            fill={note.favorite ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                          {note.code}
                        </span>

                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
                          {note.subject}
                        </span>
                      </div>

                      <h4 className="mt-3 text-lg font-bold">{note.title}</h4>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {note.content}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500"
                        >
                          <Tag size={11} />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-400">
                        Updated {note.date}
                      </span>

                      <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                        Open note →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={24} />
                </div>

                <h3 className="mt-4 font-bold">No notes found</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Try another search term or subject.
                </p>
              </div>
            )}

            {/* Quick folders */}
            <section className="mt-10">
              <h3 className="mb-4 font-bold">Quick Collections</h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Collection
                  icon={<Star size={19} />}
                  title="Favorites"
                  count="9 notes"
                  className="bg-amber-50 text-amber-600"
                />

                <Collection
                  icon={<BookOpen size={19} />}
                  title="Exam Revision"
                  count="12 notes"
                  className="bg-blue-50 text-blue-600"
                />

                <Collection
                  icon={<Brain size={19} />}
                  title="AI Topics"
                  count="8 notes"
                  className="bg-purple-50 text-purple-600"
                />

                <Collection
                  icon={<Folder size={19} />}
                  title="Recent Notes"
                  count="6 notes"
                  className="bg-emerald-50 text-emerald-600"
                />
              </div>
            </section>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
              <p>Last updated today at 3:35 PM</p>

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

function NoteStat({
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

function Collection({
  icon,
  title,
  count,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  count: string;
  className: string;
}) {
  return (
    <button className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{count}</p>
      </div>
    </button>
  );
}



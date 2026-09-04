"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Download,
  FileText,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

type Note = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  content?: string | null;
  subject?: {
    id?: string;
    name?: string | null;
    code?: string | null;
  } | null;
  subjectName?: string | null;
  subjectCode?: string | null;
  semester?: {
    name?: string | null;
    number?: number | null;
  } | null;
  semesterName?: string | null;
  category?: string | null;
  type?: string | null;
  fileUrl?: string | null;
  attachmentUrl?: string | null;
  downloadUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ApiResponse = {
  notes?: Note[];
  data?: Note[];
  items?: Note[];
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/official-notes", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unable to load notes");
      }

      const list =
        result?.notes ??
        result?.data ??
        result?.items ??
        (Array.isArray(result) ? result : []);

      setNotes(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load study materials"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const categories = useMemo(() => {
    const values = notes
      .map((note) => note.category || note.type)
      .filter((value): value is string => Boolean(value));

    return ["ALL", ...Array.from(new Set(values))];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notes.filter((note) => {
      const title = note.title || note.name || "";
      const description = note.description || note.content || "";
      const subject =
        note.subject?.name ||
        note.subjectName ||
        note.subject?.code ||
        note.subjectCode ||
        "";
      const noteCategory = note.category || note.type || "";

      const matchesSearch =
        !query ||
        `${title} ${description} ${subject} ${noteCategory}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "ALL" ||
        noteCategory.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [notes, search, category]);

  const subjectCount = useMemo(() => {
    const subjects = notes
      .map(
        (note) =>
          note.subject?.id ||
          note.subjectName ||
          note.subject?.name ||
          note.subjectCode ||
          ""
      )
      .filter(Boolean);

    return new Set(subjects).size;
  }, [notes]);

  function formatDate(value?: string | null) {
    if (!value) return "Recently added";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Recently added";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getTitle(note: Note) {
    return note.title || note.name || "Untitled Study Material";
  }

  function getSubject(note: Note) {
    return (
      note.subject?.name ||
      note.subjectName ||
      note.subject?.code ||
      note.subjectCode ||
      "Academic"
    );
  }

  function getCategory(note: Note) {
    return note.category || note.type || "NOTES";
  }

  function getDescription(note: Note) {
    return (
      note.description ||
      note.content ||
      "Study material uploaded by your college faculty."
    );
  }

  function getFileUrl(note: Note) {
    return note.fileUrl || note.attachmentUrl || note.downloadUrl || "";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-indigo-950/60 via-slate-950/20 to-transparent pointer-events-none" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <p className="text-sm font-bold tracking-wide">
                CampusMind AI
              </p>
              <p className="text-xs text-slate-400">Student Academic Portal</p>
            </div>
          </div>

          <NotificationBell />
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Official Study Materials
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Notes & Study Materials
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Access official notes, learning resources and academic materials
              published for your course and semester.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Dashboard
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Available Notes"
            value={loading ? "—" : String(notes.length)}
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Subjects"
            value={loading ? "—" : String(subjectCount)}
          />
          <StatCard
            icon={<Tag className="h-5 w-5" />}
            label="Categories"
            value={loading ? "—" : String(Math.max(categories.length - 1, 0))}
          />
        </div>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/10">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes, subjects or topics..."
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/80 pl-12 pr-10 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/50"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    category === item
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.replaceAll("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <FileText className="mx-auto mb-4 h-10 w-10 text-red-300" />
            <h2 className="text-lg font-bold">Unable to load notes</h2>
            <p className="mt-2 text-sm text-slate-400">{error}</p>

            <button
              onClick={loadNotes}
              className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              Try Again
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
              <BookOpen className="h-8 w-8 text-indigo-300" />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              {notes.length === 0
                ? "No notes available yet"
                : "No matching notes"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {notes.length === 0
                ? "Official study materials published by your faculty will appear here."
                : "Try another search term or clear the active category filter."}
            </p>

            {(search || category !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("ALL");
                }}
                className="mt-5 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-400"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Your Learning Library</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredNotes.length} material
                  {filteredNotes.length === 1 ? "" : "s"} found
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => {
                const fileUrl = getFileUrl(note);

                return (
                  <article
                    key={note.id}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.055] hover:shadow-2xl hover:shadow-indigo-950/20"
                  >
                    <div className="p-5">
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                          <FileText className="h-5 w-5" />
                        </div>

                        <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                          {getCategory(note)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                          {getSubject(note)}
                        </p>

                        <h3 className="line-clamp-2 min-h-12 text-lg font-bold leading-6 text-white">
                          {getTitle(note)}
                        </h3>
                      </div>

                      <p className="mb-5 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-400">
                        {getDescription(note)}
                      </p>

                      <div className="mb-5 flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(note.createdAt || note.updatedAt)}
                        </span>

                        {note.semester?.name || note.semesterName ? (
                          <>
                            <span>•</span>
                            <span>
                              {note.semester?.name || note.semesterName}
                            </span>
                          </>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedNote(note)}
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                        >
                          View Details
                        </button>

                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-400"
                            aria-label={`Download ${getTitle(note)}`}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {selectedNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  {getSubject(selectedNote)}
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {getTitle(selectedNote)}
                </h2>
              </div>

              <button
                onClick={() => setSelectedNote(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <InfoItem
                  label="Category"
                  value={getCategory(selectedNote)}
                />
                <InfoItem
                  label="Subject"
                  value={getSubject(selectedNote)}
                />
                <InfoItem
                  label="Published"
                  value={formatDate(
                    selectedNote.createdAt || selectedNote.updatedAt
                  )}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {getDescription(selectedNote)}
                </p>
              </div>

              {getFileUrl(selectedNote) && (
                <a
                  href={getFileUrl(selectedNote)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-400"
                >
                  <Download className="h-4 w-4" />
                  Open / Download Material
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
        {icon}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}
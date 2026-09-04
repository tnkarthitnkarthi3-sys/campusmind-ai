"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Exam = {
  id: string;
  subject: string;
  examDate: string;
  description: string | null;
  createdAt: string;
};

type FormState = {
  subject: string;
  examDate: string;
  description: string;
};

const subjects = [
  "Data Structures",
  "Database Management",
  "Computer Networks",
  "Operating Systems",
];

const emptyForm: FormState = {
  subject: "",
  examDate: "",
  description: "",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getDaysLeft(date: string) {
  const diff =
    new Date(date).getTime() - new Date().getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function loadExams() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/exams", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load exams"
        );
      }

      setExams(data.exams);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load exams"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExams();
  }, []);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter(
      (exam) =>
        !query ||
        exam.subject.toLowerCase().includes(query) ||
        (exam.description || "")
          .toLowerCase()
          .includes(query)
    );
  }, [exams, search]);

  const now = new Date();

  const upcoming = exams.filter(
    (exam) => new Date(exam.examDate) >= now
  );

  const completed = exams.filter(
    (exam) => new Date(exam.examDate) < now
  );

  const nextExam = upcoming[0];

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(exam: Exam) {
    const date = new Date(exam.examDate);

    const localDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0"
    )}T${String(date.getHours()).padStart(
      2,
      "0"
    )}:${String(date.getMinutes()).padStart(2, "0")}`;

    setEditingId(exam.id);

    setForm({
      subject: exam.subject,
      examDate: localDate,
      description: exam.description || "",
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.subject || !form.examDate) {
      setError("Please select subject and exam date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        subject: form.subject,
        examDate: new Date(form.examDate).toISOString(),
        description: form.description,
      };

      const response = await fetch("/api/exams", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? { id: editingId, ...payload }
            : payload
        ),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save exam"
        );
      }

      closeModal();
      await loadExams();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save exam"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteExam(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this exam?"
      )
    ) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/exams?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete exam"
        );
      }

      await loadExams();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete exam"
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <aside className="fixed left-0 top-0 hidden h-screen w-[250px] border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <BookOpen size={21} />
              </div>

              <div>
                <h1 className="text-[17px] font-bold">
                  CampusMind AI
                </h1>
                <p className="text-xs text-slate-400">
                  Student Workspace
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-5">
            {[
              ["Dashboard", "/dashboard"],
              ["Attendance", "/attendance"],
              ["Assignments", "/assignments"],
              ["Planner", "/planner"],
              ["Notes", "/notes"],
              ["Exams", "/exams"],
              ["AI Assistant", "/ai-assistant"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className={`mb-1 flex rounded-xl px-4 py-3 text-sm font-medium transition ${
                  href === "/exams"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <main className="lg:pl-[250px]">
        <div className="mx-auto max-w-[1450px] px-5 py-6 sm:px-8 lg:px-10">
          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-400">
                Academic Calendar
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Exams
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Stay ahead of your exams and prepare with confidence.
              </p>
            </div>

            <button
              onClick={openAdd}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Exam
            </button>
          </header>

          {error && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}

          <section className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Total Exams"
              value={exams.length}
              icon={<BookOpen size={19} />}
            />

            <StatCard
              title="Upcoming"
              value={upcoming.length}
              icon={<Clock3 size={19} />}
            />

            <StatCard
              title="Completed"
              value={completed.length}
              icon={<CheckCircle2 size={19} />}
            />
          </section>

          {nextExam && (
            <section className="mb-8 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Next Exam
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    {nextExam.subject}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {formatDate(nextExam.examDate)}
                    </span>

                    <span className="flex items-center gap-2">
                      <Clock3 size={16} />
                      {formatTime(nextExam.examDate)}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 px-6 py-4 text-center">
                  <p className="text-3xl font-bold">
                    {Math.max(
                      0,
                      getDaysLeft(nextExam.examDate)
                    )}
                  </p>

                  <p className="text-xs text-slate-300">
                    days remaining
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search exams by subject..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </section>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading exams...
              </div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <FileText
                  size={24}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-4 font-semibold">
                No exams found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add an exam to start building your academic calendar.
              </p>

              <button
                onClick={openAdd}
                className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Add Exam
              </button>
            </div>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="font-semibold">
                  Exam Schedule
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {filteredExams.length} exam
                  {filteredExams.length !== 1 ? "s" : ""} shown
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredExams.map((exam) => {
                  const isPast =
                    new Date(exam.examDate) < new Date();

                  return (
                    <article
                      key={exam.id}
                      className="flex flex-col gap-5 p-6 transition hover:bg-slate-50 md:flex-row md:items-center"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                        <BookOpen
                          size={22}
                          className="text-slate-600"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-950">
                            {exam.subject}
                          </h4>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                              isPast
                                ? "border-slate-200 bg-slate-50 text-slate-500"
                                : "border-blue-100 bg-blue-50 text-blue-600"
                            }`}
                          >
                            {isPast ? "Completed" : "Upcoming"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {formatDate(exam.examDate)}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock3 size={14} />
                            {formatTime(exam.examDate)}
                          </span>

                          {!isPast && (
                            <span className="font-semibold text-slate-700">
                              {getDaysLeft(exam.examDate)} days left
                            </span>
                          )}
                        </div>

                        {exam.description && (
                          <p className="mt-3 text-sm leading-6 text-slate-500">
                            {exam.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(exam)}
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <Edit3 size={15} />
                          Edit
                        </button>

                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="inline-flex h-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 px-3 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold">
                  {editingId ? "Edit Exam" : "Add Exam"}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Add your exam schedule.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Subject *
                </label>

                <select
                  value={form.subject}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      subject: event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value="">
                    Select subject
                  </option>

                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Exam Date & Time *
                </label>

                <input
                  type="datetime-local"
                  value={form.examDate}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      examDate: event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Add syllabus, room number, preparation notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {editingId ? "Save Changes" : "Add Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Department = {
  id: string;
  name: string;
  code: string;
};

type Course = {
  id: string;
  name: string;
  code: string;
  departmentId: string;
};

type Semester = {
  id: string;
  name: string;
  number: number;
  courseId: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  courseId: string;
  semesterId: string;
};

type Note = {
  id: string;
  title: string;
  content: string;
  noteType: string;
  status: string;
  active: boolean;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  facultyId?: string | null;
  publishedAt?: string | null;
  createdAt: string;
};

type FormState = {
  id: string;
  title: string;
  content: string;
  noteType: string;
  status: "DRAFT" | "PUBLISHED";
  active: boolean;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
};

const emptyForm: FormState = {
  id: "",
  title: "",
  content: "",
  noteType: "LECTURE",
  status: "PUBLISHED",
  active: true,
  departmentId: "",
  courseId: "",
  semesterId: "",
  subjectId: "",
};

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/notes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load notes");
      }

      setNotes(data.notes ?? []);
      setDepartments(data.departments ?? []);
      setCourses(data.courses ?? []);
      setSemesters(data.semesters ?? []);
      setSubjects(data.subjects ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notes"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          !form.departmentId ||
          course.departmentId === form.departmentId
      ),
    [courses, form.departmentId]
  );

  const filteredSemesters = useMemo(
    () =>
      semesters.filter(
        (semester) =>
          !form.courseId ||
          semester.courseId === form.courseId
      ),
    [semesters, form.courseId]
  );

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          (!form.courseId ||
            subject.courseId === form.courseId) &&
          (!form.semesterId ||
            subject.semesterId === form.semesterId)
      ),
    [subjects, form.courseId, form.semesterId]
  );

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return notes;

    return notes.filter((note) =>
      [
        note.title,
        note.content,
        note.noteType,
        note.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [notes, search]);

  const stats = useMemo(
    () => ({
      total: notes.length,
      published: notes.filter(
        (note) =>
          note.status === "PUBLISHED" &&
          note.active
      ).length,
      drafts: notes.filter(
        (note) => note.status === "DRAFT"
      ).length,
    }),
    [notes]
  );

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
    setSuccess("");
    setError("");
  }

  function openEdit(note: Note) {
    setForm({
      id: note.id,
      title: note.title,
      content: note.content,
      noteType: note.noteType,
      status:
        note.status === "PUBLISHED"
          ? "PUBLISHED"
          : "DRAFT",
      active: note.active,
      departmentId: note.departmentId,
      courseId: note.courseId,
      semesterId: note.semesterId,
      subjectId: note.subjectId,
    });

    setEditingId(note.id);
    setShowForm(true);
    setSuccess("");
    setError("");
  }

  function updateForm(
    patch: Partial<FormState>
  ) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  async function saveNote(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.content.trim() ||
      !form.departmentId ||
      !form.courseId ||
      !form.semesterId ||
      !form.subjectId
    ) {
      setError(
        "Please complete all required academic fields."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const method = editingId ? "PUT" : "POST";

      const payload = {
        ...(editingId ? { id: editingId } : {}),
        title: form.title.trim(),
        content: form.content.trim(),
        noteType: form.noteType,
        status: form.status,
        active: form.active,
        departmentId: form.departmentId,
        courseId: form.courseId,
        semesterId: form.semesterId,
        subjectId: form.subjectId,
      };

      const response = await fetch(
        "/api/admin/notes",
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to save note"
        );
      }

      setSuccess(
        editingId
          ? "Note updated successfully."
          : form.status === "PUBLISHED"
            ? "Note published successfully."
            : "Draft saved successfully."
      );

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save note"
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishNote(note: Note) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/notes",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: note.id,
            status: "PUBLISHED",
            active: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to publish note"
        );
      }

      setSuccess(
        "Note published and matching students notified."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish note"
      );
    }
  }

  async function deleteNote(id: string) {
    const confirmed = window.confirm(
      "Delete this note permanently?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/notes?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to delete note"
        );
      }

      setSuccess("Note deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete note"
      );
    } finally {
      setDeleting("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <p className="text-sm font-black">
                CampusMind AI
              </p>
              <p className="text-xs text-slate-500">
                Admin Control Center
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-bold text-indigo-300">
              <BookOpen className="h-3.5 w-3.5" />
              Academic Content
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Notes Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Publish official study materials for the correct
              department, course, semester and subject.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Total Notes"
            value={stats.total}
            icon={<FileText className="h-5 w-5" />}
          />

          <Stat
            label="Published"
            value={stats.published}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <Stat
            label="Drafts"
            value={stats.drafts}
            icon={<BookOpen className="h-5 w-5" />}
          />
        </div>

        {showForm && (
          <form
            onSubmit={saveNote}
            className="mb-8 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.04] p-5 shadow-2xl shadow-black/10 sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">
                  {editingId
                    ? "Edit Study Material"
                    : "Create Study Material"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Academic targeting is validated on the server.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Title *">
                <input
                  value={form.title}
                  onChange={(event) =>
                    updateForm({
                      title: event.target.value,
                    })
                  }
                  placeholder="Example: Unit 1 - Data Structures"
                  className={inputClass}
                />
              </Field>

              <Field label="Note Type">
                <select
                  value={form.noteType}
                  onChange={(event) =>
                    updateForm({
                      noteType: event.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="LECTURE">
                    Lecture Notes
                  </option>
                  <option value="UNIT">
                    Unit Material
                  </option>
                  <option value="QUESTION_BANK">
                    Question Bank
                  </option>
                  <option value="REFERENCE">
                    Reference Material
                  </option>
                  <option value="LAB">
                    Lab Material
                  </option>
                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </Field>

              <Field label="Department *">
                <Select
                  value={form.departmentId}
                  onChange={(value) =>
                    updateForm({
                      departmentId: value,
                      courseId: "",
                      semesterId: "",
                      subjectId: "",
                    })
                  }
                  placeholder="Select department"
                  options={departments.map((item) => ({
                    value: item.id,
                    label: `${item.name} (${item.code})`,
                  }))}
                />
              </Field>

              <Field label="Course *">
                <Select
                  value={form.courseId}
                  onChange={(value) =>
                    updateForm({
                      courseId: value,
                      semesterId: "",
                      subjectId: "",
                    })
                  }
                  placeholder="Select course"
                  options={filteredCourses.map((item) => ({
                    value: item.id,
                    label: `${item.name} (${item.code})`,
                  }))}
                  disabled={!form.departmentId}
                />
              </Field>

              <Field label="Semester *">
                <Select
                  value={form.semesterId}
                  onChange={(value) =>
                    updateForm({
                      semesterId: value,
                      subjectId: "",
                    })
                  }
                  placeholder="Select semester"
                  options={filteredSemesters.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  disabled={!form.courseId}
                />
              </Field>

              <Field label="Subject *">
                <Select
                  value={form.subjectId}
                  onChange={(value) =>
                    updateForm({
                      subjectId: value,
                    })
                  }
                  placeholder="Select subject"
                  options={filteredSubjects.map((item) => ({
                    value: item.id,
                    label: `${item.name} (${item.code})`,
                  }))}
                  disabled={!form.semesterId}
                />
              </Field>

              <Field
                label="Description / Content *"
                className="lg:col-span-2"
              >
                <textarea
                  value={form.content}
                  onChange={(event) =>
                    updateForm({
                      content: event.target.value,
                    })
                  }
                  placeholder="Enter official study material content..."
                  rows={8}
                  className={`${inputClass} resize-y py-3`}
                />
              </Field>

              <Field label="Publishing Status">
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm({
                      status:
                        event.target.value as
                          | "DRAFT"
                          | "PUBLISHED",
                    })
                  }
                  className={inputClass}
                >
                  <option value="PUBLISHED">
                    Publish Now
                  </option>
                  <option value="DRAFT">
                    Save as Draft
                  </option>
                </select>
              </Field>

              <Field label="Availability">
                <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-4">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      updateForm({
                        active: event.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-300">
                    Active study material
                  </span>
                </label>
              </Field>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {editingId
                  ? "Update Note"
                  : "Save Note"}
              </button>
            </div>
          </form>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-black">
                Published & Draft Materials
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Manage all official academic notes.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search notes..."
                className="h-10 w-full rounded-xl border border-white/10 bg-slate-900 pl-10 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-400/40"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Loading notes...
            </div>
          ) : visibleNotes.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-700" />
              <p className="mt-4 font-semibold text-slate-400">
                No notes found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {visibleNotes.map((note) => {
                const department = departments.find(
                  (item) =>
                    item.id === note.departmentId
                );

                const course = courses.find(
                  (item) =>
                    item.id === note.courseId
                );

                const semester = semesters.find(
                  (item) =>
                    item.id === note.semesterId
                );

                const subject = subjects.find(
                  (item) =>
                    item.id === note.subjectId
                );

                return (
                  <div
                    key={note.id}
                    className="p-5 transition hover:bg-white/[0.025]"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                            {note.noteType}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              note.status === "PUBLISHED" &&
                              note.active
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            {note.status === "PUBLISHED" &&
                            note.active
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>

                        <h3 className="mt-3 truncate text-lg font-bold">
                          {note.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {note.content}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span>
                            {department?.code ||
                              "Department"}
                          </span>
                          <span>
                            {course?.code || "Course"}
                          </span>
                          <span>
                            {semester?.name ||
                              "Semester"}
                          </span>
                          <span>
                            {subject?.code ||
                              "Subject"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {note.status !== "PUBLISHED" && (
                          <button
                            onClick={() =>
                              publishNote(note)
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Publish
                          </button>
                        )}

                        <button
                          onClick={() =>
                            openEdit(note)
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteNote(note.id)
                          }
                          disabled={
                            deleting === note.id
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-400/10 bg-red-400/5 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-400/10 disabled:opacity-50"
                        >
                          {deleting === note.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/50";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        className={`${inputClass} appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}
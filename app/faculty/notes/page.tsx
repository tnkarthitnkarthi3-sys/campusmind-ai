"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  Loader2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

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
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  publishedAt?: string | null;
  createdAt: string;
  department?: { id: string; name: string; code: string };
  course?: { id: string; name: string; code: string };
  semester?: { id: string; name: string; number: number };
  subject?: { id: string; name: string; code: string };
};

type Option = {
  id: string;
  name: string;
  code?: string;
  number?: number;
  departmentId?: string;
  courseId?: string;
  semesterId?: string;
};

type FormState = {
  title: string;
  content: string;
  noteType: string;
  status: string;
  active: boolean;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
};

const initialForm: FormState = {
  title: "",
  content: "",
  noteType: "LECTURE",
  status: "DRAFT",
  active: true,
  departmentId: "",
  courseId: "",
  semesterId: "",
  subjectId: "",
};

export default function FacultyNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);

  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/faculty/notes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load notes");
      }

      setNotes(data.notes ?? []);
      setDepartments(data.departments ?? []);
      setCourses(data.courses ?? []);
      setSemesters(data.semesters ?? []);
      setSubjects(data.subjects ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load faculty notes",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) => course.departmentId === form.departmentId,
      ),
    [courses, form.departmentId],
  );

  const filteredSemesters = useMemo(
    () =>
      semesters.filter(
        (semester) => semester.courseId === form.courseId,
      ),
    [semesters, form.courseId],
  );

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) => subject.semesterId === form.semesterId,
      ),
    [subjects, form.semesterId],
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return notes;

    return notes.filter((note) =>
      [
        note.title,
        note.content,
        note.noteType,
        note.status,
        note.subject?.name,
        note.subject?.code,
        note.course?.name,
        note.department?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [notes, search]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  }

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleDepartmentChange(value: string) {
    setForm((current) => ({
      ...current,
      departmentId: value,
      courseId: "",
      semesterId: "",
      subjectId: "",
    }));
  }

  function handleCourseChange(value: string) {
    setForm((current) => ({
      ...current,
      courseId: value,
      semesterId: "",
      subjectId: "",
    }));
  }

  function handleSemesterChange(value: string) {
    setForm((current) => ({
      ...current,
      semesterId: value,
      subjectId: "",
    }));
  }

  function editNote(note: Note) {
    setEditingId(note.id);

    setForm({
      title: note.title,
      content: note.content,
      noteType: note.noteType,
      status: note.status,
      active: note.active,
      departmentId: note.departmentId,
      courseId: note.courseId,
      semesterId: note.semesterId,
      subjectId: note.subjectId,
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function saveNote() {
    if (!form.title.trim()) {
      setError("Please enter note title.");
      return;
    }

    if (!form.content.trim()) {
      setError("Please enter note content.");
      return;
    }

    if (
      !form.departmentId ||
      !form.courseId ||
      !form.semesterId ||
      !form.subjectId
    ) {
      setError("Please select department, course, semester and subject.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/faculty/notes", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? {
                id: editingId,
                title: form.title.trim(),
                content: form.content.trim(),
                noteType: form.noteType,
                status: form.status,
                active: form.active,
              }
            : {
                title: form.title.trim(),
                content: form.content.trim(),
                noteType: form.noteType,
                status: form.status,
                active: form.active,
                departmentId: form.departmentId,
                courseId: form.courseId,
                semesterId: form.semesterId,
                subjectId: form.subjectId,
              },
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save note");
      }

      setSuccess(editingId ? "Note updated successfully." : "Note created successfully.");

      resetForm();
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save note");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(`/api/faculty/notes?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete note");
      }

      setSuccess("Note deleted successfully.");
      setNotes((current) => current.filter((note) => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete note");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
    }).format(new Date(value));
  }

  function formatFileSize(size?: number | null) {
    if (!size) return "";

    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  const publishedCount = notes.filter(
    (note) => note.status === "PUBLISHED" && note.active,
  ).length;

  const draftCount = notes.filter(
    (note) => note.status === "DRAFT",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
                <BookOpen className="h-4 w-4" />
                Faculty Academic Notes
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Manage Your Notes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Create, organize and publish study materials for your assigned
                students.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
                setShowForm(true);
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              <Plus className="h-5 w-5" />
              Create Note
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Notes"
            value={notes.length}
            icon={<FileText className="h-5 w-5" />}
          />

          <StatCard
            label="Published"
            value={publishedCount}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Drafts"
            value={draftCount}
            icon={<Clock3 className="h-5 w-5" />}
          />
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </div>
        )}

        {showForm && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Note" : "Create New Note"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add academic material for your students.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Input
                label="Note Title"
                value={form.title}
                onChange={(value) => updateField("title", value)}
                placeholder="Example: Unit 1 Introduction"
              />

              <Select
                label="Note Type"
                value={form.noteType}
                onChange={(value) => updateField("noteType", value)}
                options={[
                  ["LECTURE", "Lecture"],
                  ["UNIT", "Unit Notes"],
                  ["REVISION", "Revision"],
                  ["IMPORTANT", "Important Questions"],
                  ["REFERENCE", "Reference"],
                ]}
              />

              <Select
                label="Department"
                value={form.departmentId}
                onChange={handleDepartmentChange}
                options={[
                  ["", "Select Department"],
                  ...departments.map((item) => [
                    item.id,
                    item.code ? `${item.name} (${item.code})` : item.name,
                  ]),
                ]}
              />

              <Select
                label="Course"
                value={form.courseId}
                onChange={handleCourseChange}
                disabled={!form.departmentId}
                options={[
                  ["", "Select Course"],
                  ...filteredCourses.map((item) => [
                    item.id,
                    item.code ? `${item.name} (${item.code})` : item.name,
                  ]),
                ]}
              />

              <Select
                label="Semester"
                value={form.semesterId}
                onChange={handleSemesterChange}
                disabled={!form.courseId}
                options={[
                  ["", "Select Semester"],
                  ...filteredSemesters.map((item) => [
                    item.id,
                    item.name,
                  ]),
                ]}
              />

              <Select
                label="Subject"
                value={form.subjectId}
                onChange={(value) => updateField("subjectId", value)}
                disabled={!form.semesterId}
                options={[
                  ["", "Select Subject"],
                  ...filteredSubjects.map((item) => [
                    item.id,
                    item.code ? `${item.name} (${item.code})` : item.name,
                  ]),
                ]}
              />

              <Select
                label="Status"
                value={form.status}
                onChange={(value) => updateField("status", value)}
                options={[
                  ["DRAFT", "Draft"],
                  ["PUBLISHED", "Published"],
                ]}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Availability
                </label>

                <button
                  type="button"
                  onClick={() => updateField("active", !form.active)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium ${
                    form.active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <span>{form.active ? "Active" : "Inactive"}</span>

                  <span
                    className={`h-5 w-9 rounded-full p-0.5 transition ${
                      form.active ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white transition ${
                        form.active ? "translate-x-4" : ""
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Note Content
              </label>

              <textarea
                value={form.content}
                onChange={(event) =>
                  updateField("content", event.target.value)
                }
                rows={8}
                placeholder="Write the academic note content here..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveNote}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Update Note" : "Create Note"}
              </button>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your Academic Notes
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Notes created by your faculty account.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="font-semibold text-slate-900">
                No notes found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Create your first academic note to make study materials
                available to students.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotes.map((note) => (
                <article
                  key={note.id}
                  className="p-5 transition hover:bg-slate-50/70 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {note.title}
                        </h3>

                        <Badge
                          label={note.status}
                          type={
                            note.status === "PUBLISHED"
                              ? "success"
                              : "warning"
                          }
                        />

                        {!note.active && (
                          <Badge label="INACTIVE" type="danger" />
                        )}
                      </div>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {note.content}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <Meta text={note.department?.code || "Department"} />
                        <Meta text={note.course?.code || "Course"} />
                        <Meta text={note.semester?.name || "Semester"} />
                        <Meta text={note.subject?.code || "Subject"} />
                        <Meta text={note.noteType} />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>Created {formatDate(note.createdAt)}</span>

                        {note.fileName && (
                          <span>
                            📄 {note.fileName}
                            {note.fileSize
                              ? ` • ${formatFileSize(note.fileSize)}`
                              : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => editNote(note)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white hover:shadow-sm"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => deleteNote(note.id)}
                        disabled={deletingId === note.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === note.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-600">
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function Badge({
  label,
  type,
}: {
  label: string;
  type: "success" | "warning" | "danger";
}) {
  const classes = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${classes[type]}`}
    >
      {label}
    </span>
  );
}

function Meta({ text }: { text: string }) {
  return (
    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-medium text-slate-600">
      {text}
    </span>
  );
}
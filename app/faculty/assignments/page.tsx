"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";

type Subject = {
  id: string;
  name: string;
  code?: string | null;
  course?: {
    id: string;
    name: string;
    code: string;
  } | null;
  semester?: {
    id: string;
    name: string;
    number: number;
  } | null;
};

type Assignment = {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  subjectId: string;
  dueDate: string;
  totalMarks: number;
  priority: string;
  status: string;
  assignedDate: string;
  subject?: {
    id: string;
    name: string;
    code: string;
  } | null;
};

type AssignmentForm = {
  title: string;
  description: string;
  instructions: string;
  subjectId: string;
  dueDate: string;
  totalMarks: string;
  priority: string;
  status: string;
};

const emptyForm: AssignmentForm = {
  title: "",
  description: "",
  instructions: "",
  subjectId: "",
  dueDate: "",
  totalMarks: "10",
  priority: "MEDIUM",
  status: "PUBLISHED",
};

function formatDate(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toInputDate(value: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function priorityClass(priority: string) {
  switch (priority) {
    case "HIGH":
      return "border-red-500/20 bg-red-500/10 text-red-300";

    case "LOW":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }
}

function statusClass(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

    case "DRAFT":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";

    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }
}

export default function FacultyAssignmentsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [form, setForm] = useState<AssignmentForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSubjects() {
    const response = await fetch("/api/faculty/subjects", {
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error || "Unable to load faculty subjects.",
      );
    }

    const list =
      data?.subjects ||
      data?.facultySubjects ||
      data?.data ||
      [];

    setSubjects(Array.isArray(list) ? list : []);

    return Array.isArray(list) ? list : [];
  }

  async function loadAssignments(subjectId = "ALL") {
    const url =
      subjectId && subjectId !== "ALL"
        ? `/api/faculty/assignments?subjectId=${encodeURIComponent(subjectId)}`
        : "/api/faculty/assignments";

    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error || "Unable to load assignments.",
      );
    }

    const list = data?.assignments || data?.data || [];

    setAssignments(Array.isArray(list) ? list : []);
  }

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      await loadSubjects();
      await loadAssignments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Faculty Assignments.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadAssignments(selectedSubject);
    }
  }, [selectedSubject]);

  function openCreate() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      subjectId:
        selectedSubject !== "ALL"
          ? selectedSubject
          : subjects[0]?.id || "",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEdit(assignment: Assignment) {
    setEditingId(assignment.id);

    setForm({
      title: assignment.title || "",
      description: assignment.description || "",
      instructions: assignment.instructions || "",
      subjectId: assignment.subjectId,
      dueDate: toInputDate(assignment.dueDate),
      totalMarks: String(assignment.totalMarks ?? 10),
      priority: assignment.priority || "MEDIUM",
      status: assignment.status || "PUBLISHED",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateForm(
    field: keyof AssignmentForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveAssignment() {
    if (!form.title.trim()) {
      setError("Assignment title is required.");
      return;
    }

    if (!form.subjectId) {
      setError("Please select a subject.");
      return;
    }

    if (!form.dueDate) {
      setError("Please select a due date.");
      return;
    }

    const totalMarks = Number(form.totalMarks);

    if (!Number.isInteger(totalMarks) || totalMarks <= 0) {
      setError("Total marks must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing = Boolean(editingId);

      const response = await fetch(
        "/api/faculty/assignments",
        {
          method: isEditing ? "PATCH" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isEditing
              ? {
                  id: editingId,
                  title: form.title.trim(),
                  description: form.description.trim(),
                  instructions: form.instructions.trim(),
                  dueDate: form.dueDate,
                  totalMarks,
                  priority: form.priority,
                  status: form.status,
                }
              : {
                  title: form.title.trim(),
                  description: form.description.trim(),
                  instructions: form.instructions.trim(),
                  subjectId: form.subjectId,
                  dueDate: form.dueDate,
                  totalMarks,
                  priority: form.priority,
                  status: form.status,
                },
          ),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to save assignment.",
        );
      }

      setSuccess(
        isEditing
          ? "Assignment updated successfully."
          : "Assignment created successfully.",
      );

      closeForm();

      await loadAssignments(selectedSubject);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save assignment.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAssignment(id: string) {
    const confirmed = window.confirm(
      "Delete this assignment? It will be removed from the active faculty list.",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/faculty/assignments?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to delete assignment.",
        );
      }

      setSuccess("Assignment deleted successfully.");

      await loadAssignments(selectedSubject);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete assignment.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredAssignments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return assignments;
    }

    return assignments.filter((assignment) => {
      return [
        assignment.title,
        assignment.description,
        assignment.subject?.name,
        assignment.subject?.code,
        assignment.priority,
        assignment.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value);
    });
  }, [assignments, search]);

  const stats = useMemo(() => {
    return {
      total: assignments.length,
      published: assignments.filter(
        (item) => item.status === "PUBLISHED",
      ).length,
      drafts: assignments.filter(
        (item) => item.status === "DRAFT",
      ).length,
      highPriority: assignments.filter(
        (item) => item.priority === "HIGH",
      ).length,
    };
  }, [assignments]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
            <span className="text-sm text-slate-300">
              Loading Faculty Assignments...
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/faculty"
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Faculty Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Assignment Management
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Create, edit and manage assignments for your subjects.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Create Assignment
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <FileText className="mb-3 h-5 w-5 text-indigo-400" />
            <p className="text-2xl font-bold">
              {stats.total}
            </p>
            <p className="text-xs text-slate-500">
              Total Assignments
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-400" />
            <p className="text-2xl font-bold text-emerald-300">
              {stats.published}
            </p>
            <p className="text-xs text-emerald-200/60">
              Published
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <Edit3 className="mb-3 h-5 w-5 text-amber-400" />
            <p className="text-2xl font-bold text-amber-300">
              {stats.drafts}
            </p>
            <p className="text-xs text-amber-200/60">
              Drafts
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <CalendarDays className="mb-3 h-5 w-5 text-red-400" />
            <p className="text-2xl font-bold text-red-300">
              {stats.highPriority}
            </p>
            <p className="text-xs text-red-200/60">
              High Priority
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Subject
              </label>

              <select
                value={selectedSubject}
                onChange={(event) =>
                  setSelectedSubject(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="ALL">
                  All My Subjects
                </option>

                {subjects.map((subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.code
                      ? `${subject.code} — ${subject.name}`
                      : subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Search
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search assignment..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <BookOpen className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-lg font-bold">
                No assignments found
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Create your first assignment for one of your assigned subjects.
              </p>

              <button
                type="button"
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                Create Assignment
              </button>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <article
                key={assignment.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl transition hover:border-white/15"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                        {assignment.subject?.code ||
                          "Subject"}
                      </span>

                      <span
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${priorityClass(
                          assignment.priority,
                        )}`}
                      >
                        {assignment.priority}
                      </span>

                      <span
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${statusClass(
                          assignment.status,
                        )}`}
                      >
                        {assignment.status}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-bold text-white">
                      {assignment.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {assignment.subject?.name ||
                        "Assigned Subject"}
                    </p>

                    {assignment.description && (
                      <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {assignment.description}
                      </p>
                    )}

                    {assignment.instructions && (
                      <div className="mt-4 rounded-xl border border-white/5 bg-black/10 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Instructions
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400">
                          {assignment.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 lg:w-56">
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <p className="text-xs text-slate-600">
                        Due Date
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {formatDate(assignment.dueDate)}
                      </p>

                      <div className="mt-3 h-px bg-white/5" />

                      <p className="mt-3 text-xs text-slate-600">
                        Total Marks
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {assignment.totalMarks}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(assignment)
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteAssignment(assignment.id)
                        }
                        disabled={
                          deletingId === assignment.id
                        }
                        className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === assignment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-6 py-5 backdrop-blur">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId
                    ? "Edit Assignment"
                    : "Create Assignment"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Faculty management
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Assignment Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      "title",
                      event.target.value,
                    )
                  }
                  placeholder="Example: Data Structures Unit 2 Assignment"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Subject
                  </label>

                  <select
                    value={form.subjectId}
                    onChange={(event) =>
                      updateForm(
                        "subjectId",
                        event.target.value,
                      )
                    }
                    disabled={Boolean(editingId)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-60"
                  >
                    <option value="">
                      Select subject
                    </option>

                    {subjects.map((subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.code
                          ? `${subject.code} — ${subject.name}`
                          : subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateForm(
                        "dueDate",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value,
                    )
                  }
                  rows={4}
                  placeholder="Explain what students need to complete..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Instructions
                </label>

                <textarea
                  value={form.instructions}
                  onChange={(event) =>
                    updateForm(
                      "instructions",
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Submission instructions, format, rules..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Total Marks
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.totalMarks}
                    onChange={(event) =>
                      updateForm(
                        "totalMarks",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(event) =>
                      updateForm(
                        "priority",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">
                      Low
                    </option>
                    <option value="MEDIUM">
                      Medium
                    </option>
                    <option value="HIGH">
                      High
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  >
                    <option value="DRAFT">
                      Draft
                    </option>
                    <option value="PUBLISHED">
                      Published
                    </option>
                    <option value="CLOSED">
                      Closed
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.08] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveAssignment}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Assignment"
                      : "Create Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

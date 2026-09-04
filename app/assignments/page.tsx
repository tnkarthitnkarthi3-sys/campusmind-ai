"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type AssignmentStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED";

type Priority = "Low" | "Medium" | "High";

type Assignment = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  dueDate: string;
  status: AssignmentStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
};

type Summary = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

type FormState = {
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  priority: Priority;
};

const emptyForm: FormState = {
  title: "",
  subject: "",
  description: "",
  dueDate: "",
  status: "PENDING",
  priority: "Medium",
};

const subjects = [
  "Data Structures",
  "Database Management",
  "Computer Networks",
  "Operating Systems",
];

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function getDueLabel(dateString: string, status: AssignmentStatus) {
  const due = new Date(dateString);
  const now = new Date();

  if (status === "COMPLETED") {
    return "Completed";
  }

  const diff = due.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`;
  }

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "Due tomorrow";
  }

  return `${days} days left`;
}

function statusLabel(status: AssignmentStatus) {
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "COMPLETED") return "Completed";
  return "Pending";
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function loadAssignments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/assignments", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load assignments");
      }

      setAssignments(data.assignments);
      setSummary(data.summary);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(assignment: Assignment) {
    setEditingId(assignment.id);

    const localDate = new Date(assignment.dueDate);

    const dateValue = `${localDate.getFullYear()}-${String(
      localDate.getMonth() + 1
    ).padStart(2, "0")}-${String(localDate.getDate()).padStart(
      2,
      "0"
    )}T${String(localDate.getHours()).padStart(
      2,
      "0"
    )}:${String(localDate.getMinutes()).padStart(2, "0")}`;

    setForm({
      title: assignment.title,
      subject: assignment.subject,
      description: assignment.description || "",
      dueDate: dateValue,
      status: assignment.status,
      priority: assignment.priority,
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.subject.trim() || !form.dueDate) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
        dueDate: new Date(form.dueDate).toISOString(),
        status: form.status,
        priority: form.priority.toUpperCase(),
      };

      const response = await fetch("/api/assignments", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? {
                id: editingId,
                ...payload,
              }
            : payload
        ),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save assignment"
        );
      }

      closeModal();
      await loadAssignments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save assignment"
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    assignment: Assignment,
    status: AssignmentStatus
  ) {
    try {
      const response = await fetch("/api/assignments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject,
          description: assignment.description || "",
          dueDate: assignment.dueDate,
          status,
          priority: assignment.priority.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      await loadAssignments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update status"
      );
    }
  }

  async function deleteAssignment(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/assignments?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete assignment"
        );
      }

      await loadAssignments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete assignment"
      );
    }
  }

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const matchesSearch =
        !query ||
        assignment.title.toLowerCase().includes(query) ||
        assignment.subject.toLowerCase().includes(query) ||
        (assignment.description || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        assignment.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        assignment.priority.toUpperCase() ===
          priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    assignments,
    search,
    statusFilter,
    priorityFilter,
  ]);

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
                className={`mb-1 flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                  href === "/assignments"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400">
                CAMPUSMIND AI
              </p>
              <p className="mt-1 text-sm font-semibold">
                Stay organized.
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Manage your academic work in one place.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:pl-[250px]">
        <div className="mx-auto max-w-[1450px] px-5 py-6 sm:px-8 lg:px-10">
          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-400">
                Academic Workspace
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Assignments
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Track deadlines, manage priorities and keep
                your coursework moving forward.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Assignment
            </button>
          </header>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} />
              <span className="flex-1">{error}</span>

              <button
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Total"
              value={summary.total}
              icon={<BookOpen size={19} />}
            />

            <StatCard
              title="Pending"
              value={summary.pending}
              icon={<Clock3 size={19} />}
            />

            <StatCard
              title="In Progress"
              value={summary.inProgress}
              icon={<Loader2 size={19} />}
            />

            <StatCard
              title="Completed"
              value={summary.completed}
              icon={<CheckCircle2 size={19} />}
            />

            <StatCard
              title="Overdue"
              value={summary.overdue}
              icon={<AlertCircle size={19} />}
              danger={summary.overdue > 0}
            />
          </section>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search assignments..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-11 w-full min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm outline-none focus:border-slate-400"
                >
                  <option value="ALL">
                    All Status
                  </option>
                  <option value="PENDING">
                    Pending
                  </option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="COMPLETED">
                    Completed
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(event.target.value)
                  }
                  className="h-11 w-full min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-9 text-sm outline-none focus:border-slate-400"
                >
                  <option value="ALL">
                    All Priority
                  </option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-950">
                    Assignment List
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {filteredAssignments.length} assignment
                    {filteredAssignments.length !== 1
                      ? "s"
                      : ""}{" "}
                    shown
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Loading assignments...
                </div>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <BookOpen
                    size={24}
                    className="text-slate-400"
                  />
                </div>

                <h3 className="font-semibold text-slate-900">
                  No assignments found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Try changing your filters or add a new
                  assignment to get started.
                </p>

                <button
                  onClick={openAddModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus size={16} />
                  Add Assignment
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAssignments.map((assignment) => (
                  <article
                    key={assignment.id}
                    className="group p-5 transition hover:bg-slate-50/70 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                      <div className="flex min-w-0 flex-1 gap-4">
                        <div className="mt-1 hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 sm:flex">
                          <BookOpen size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-slate-950">
                              {assignment.title}
                            </h4>

                            <PriorityBadge
                              priority={assignment.priority}
                            />

                            <StatusBadge
                              status={assignment.status}
                            />
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                            <span className="font-medium text-slate-600">
                              {assignment.subject}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={14} />
                              {formatDate(
                                assignment.dueDate
                              )}
                            </span>

                            <span
                              className={
                                assignment.status !==
                                  "COMPLETED" &&
                                new Date(
                                  assignment.dueDate
                                ) < new Date()
                                  ? "font-semibold text-red-600"
                                  : "text-slate-500"
                              }
                            >
                              {getDueLabel(
                                assignment.dueDate,
                                assignment.status
                              )}
                            </span>
                          </div>

                          {assignment.description && (
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={assignment.status}
                          onChange={(event) =>
                            updateStatus(
                              assignment,
                              event.target
                                .value as AssignmentStatus
                            )
                          }
                          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-slate-400"
                        >
                          <option value="PENDING">
                            Pending
                          </option>
                          <option value="IN_PROGRESS">
                            In Progress
                          </option>
                          <option value="COMPLETED">
                            Completed
                          </option>
                        </select>

                        <button
                          onClick={() =>
                            openEditModal(assignment)
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <Edit3 size={15} />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteAssignment(assignment.id)
                          }
                          className="inline-flex h-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 px-3 text-red-600 transition hover:border-red-200 hover:bg-red-100"
                          aria-label="Delete assignment"
                        >
                          <Trash2 size={15} />
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {editingId
                    ? "Edit Assignment"
                    : "Add Assignment"}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Keep your academic work organized.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Assignment Title *
                </label>

                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder="e.g. Database Normalization Report"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Due Date *
                  </label>

                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        dueDate: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priority:
                          event.target.value as Priority,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">
                      Medium
                    </option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status:
                          event.target
                            .value as AssignmentStatus,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="PENDING">
                      Pending
                    </option>
                    <option value="IN_PROGRESS">
                      In Progress
                    </option>
                    <option value="COMPLETED">
                      Completed
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                  placeholder="Add assignment details, requirements or notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {editingId
                    ? "Save Changes"
                    : "Add Assignment"}
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
  danger = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            danger
              ? "bg-red-50 text-red-600"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`mt-4 text-3xl font-bold ${
          danger ? "text-red-600" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const styles =
    priority.toUpperCase() === "HIGH"
      ? "bg-red-50 text-red-600 border-red-100"
      : priority.toUpperCase() === "LOW"
        ? "bg-slate-50 text-slate-500 border-slate-200"
        : "bg-amber-50 text-amber-600 border-amber-100";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: AssignmentStatus;
}) {
  const styles =
    status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : status === "IN_PROGRESS"
        ? "bg-blue-50 text-blue-600 border-blue-100"
        : "bg-orange-50 text-orange-600 border-orange-100";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles}`}
    >
      {statusLabel(status)}
    </span>
  );
}

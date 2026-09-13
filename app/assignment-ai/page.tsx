"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  X,
} from "lucide-react";

type Assignment = {
  id?: string;
  title: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
};

type DashboardResponse = {
  assignments?: Assignment[];
  upcoming?: {
    assignments?: Assignment[];
  };
};

type AIResult = {
  action: string;
  answer: string;
};

const fallbackAssignments: Assignment[] = [
  {
    id: "demo-1",
    title: "Operating Systems Process Scheduling",
    subject: "Operating Systems",
    description:
      "Prepare a report explaining FCFS, SJF, Round Robin and Priority Scheduling with suitable examples.",
    status: "PENDING",
    dueDate: "2026-09-15",
  },
  {
    id: "demo-2",
    title: "Database Normalization",
    subject: "DBMS",
    description:
      "Explain 1NF, 2NF, 3NF and BCNF with examples and relational tables.",
    status: "IN_PROGRESS",
    dueDate: "2026-09-18",
  },
  {
    id: "demo-3",
    title: "Computer Networks TCP/IP Report",
    subject: "Computer Networks",
    description:
      "Create a report covering TCP/IP layers, protocols and practical applications.",
    status: "COMPLETED",
    dueDate: "2026-09-10",
  },
];

function getPriority(assignment: Assignment) {
  if (assignment.priority) {
    const value = assignment.priority.toUpperCase();

    if (value.includes("HIGH")) return "HIGH";
    if (value.includes("MEDIUM")) return "MEDIUM";
    if (value.includes("LOW")) return "LOW";
  }

  const status = (assignment.status || "").toUpperCase();

  if (status.includes("OVERDUE")) return "HIGH";
  if (status.includes("COMPLETED")) return "LOW";

  if (assignment.dueDate) {
    const due = new Date(assignment.dueDate).getTime();
    const now = Date.now();
    const days = Math.ceil((due - now) / 86400000);

    if (days <= 2) return "HIGH";
    if (days <= 7) return "MEDIUM";
  }

  return "LOW";
}

function getDeadlineText(date?: string) {
  if (!date) return "No deadline";

  const due = new Date(date);
  if (Number.isNaN(due.getTime())) return date;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  due.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (due.getTime() - today.getTime()) / 86400000
  );

  if (diff < 0) return `${Math.abs(diff)} day(s) overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";

  return `${diff} days remaining`;
}

function formatDate(date?: string) {
  if (!date) return "No deadline";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function priorityStyle(priority: string) {
  if (priority === "HIGH") {
    return {
      badge: "border-red-400/30 bg-red-500/10 text-red-300",
      dot: "bg-red-400",
    };
  }

  if (priority === "MEDIUM") {
    return {
      badge: "border-amber-400/30 bg-amber-500/10 text-amber-300",
      dot: "bg-amber-400",
    };
  }

  return {
    badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  };
}

function statusStyle(status?: string) {
  const value = (status || "").toUpperCase();

  if (value.includes("COMPLETED")) {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  if (value.includes("PROGRESS")) {
    return "border-blue-400/20 bg-blue-500/10 text-blue-300";
  }

  return "border-slate-500/30 bg-slate-500/10 text-slate-300";
}

export default function AssignmentAIPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load assignments.");
      }

      const data: DashboardResponse = await response.json();

      const fromDashboard =
        data.assignments ||
        data.upcoming?.assignments ||
        [];

      if (Array.isArray(fromDashboard) && fromDashboard.length > 0) {
        setAssignments(fromDashboard);
      } else {
        setAssignments(fallbackAssignments);
      }
    } catch (err) {
      console.error(err);
      setAssignments(fallbackAssignments);
      setError("Live assignments could not be loaded. Demo assignments are shown.");
    } finally {
      setLoading(false);
    }
  }

  const normalized = useMemo(() => {
    return assignments.map((assignment) => ({
      ...assignment,
      priority: getPriority(assignment),
    }));
  }, [assignments]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return normalized;

    return normalized.filter((assignment) => {
      const status = (assignment.status || "").toUpperCase();

      if (filter === "PENDING") {
        return (
          !status.includes("COMPLETED") &&
          !status.includes("PROGRESS")
        );
      }

      if (filter === "PROGRESS") {
        return status.includes("PROGRESS");
      }

      if (filter === "COMPLETED") {
        return status.includes("COMPLETED");
      }

      if (filter === "HIGH") {
        return assignment.priority === "HIGH";
      }

      return true;
    });
  }, [normalized, filter]);

  const stats = useMemo(() => {
    const total = normalized.length;
    const completed = normalized.filter((a) =>
      (a.status || "").toUpperCase().includes("COMPLETED")
    ).length;

    const high = normalized.filter(
      (a) => a.priority === "HIGH"
    ).length;

    const pending = total - completed;

    return {
      total,
      completed,
      high,
      pending,
      progress:
        total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [normalized]);

  async function updateAssignmentStatus(
    nextStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  ) {
    if (!selected?.id || selected.id.startsWith("demo-")) {
      setError("This demo assignment is not connected to the database.");
      return;
    }

    try {
      setError("");

      const response = await fetch("/api/assignments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selected.id,
          title: selected.title,
          subject: selected.subject || "General",
          description: selected.description || "",
          dueDate: selected.dueDate,
          status: nextStatus,
          priority:
            selected.priority === "HIGH" ||
            selected.priority === "MEDIUM" ||
            selected.priority === "LOW"
              ? selected.priority
              : "MEDIUM",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update assignment.");
      }

      const updated = data.assignment as Assignment;

      setAssignments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );

      setSelected(updated);
      setAiResult(null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update assignment status."
      );
    }
  }

  async function runAI(action: string) {
    if (!selected) return;

    try {
      setAiLoading(true);
      setAiResult(null);

      const response = await fetch("/api/assignments/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          assignment: selected,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "AI request failed."
        );
      }

      setAiResult({
        action,
        answer: data.answer,
      });
    } catch (err) {
      console.error(err);

      setAiResult({
        action,
        answer:
          err instanceof Error
            ? err.message
            : "Unable to get AI response.",
      });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.20),transparent_65%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by CampusMind AI
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Assignment AI
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Understand your assignments, detect priority, break difficult
              work into simple steps and build a smarter completion plan.
            </p>
          </div>

          <button
            onClick={loadAssignments}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <Target className="h-4 w-4" />
            Refresh Assignments
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<FileText className="h-5 w-5" />}
            label="Total Assignments"
            value={stats.total}
            detail="Academic tasks"
          />

          <Stat
            icon={<Clock3 className="h-5 w-5" />}
            label="Pending"
            value={stats.pending}
            detail="Need attention"
          />

          <Stat
            icon={<AlertCircle className="h-5 w-5" />}
            label="High Priority"
            value={stats.high}
            detail="Work on these first"
          />

          <Stat
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completion"
            value={`${stats.progress}%`}
            detail={`${stats.completed} completed`}
          />
        </section>

        {/* Main */}
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Assignment list */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Your Assignments
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select an assignment to activate AI tools.
                </p>
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#0b1020] px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-400/50"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>

            {loading ? (
              <div className="flex min-h-80 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400" />
                  <p className="mt-3 text-sm text-slate-500">
                    Loading assignments...
                  </p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <FileText className="h-10 w-10 text-slate-600" />
                <h3 className="mt-4 font-semibold">
                  No assignments found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try another filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((assignment, index) => {
                  const priority = assignment.priority || "LOW";
                  const pStyle = priorityStyle(priority);
                  const isSelected =
                    selected?.id === assignment.id ||
                    (!selected && index === 0);

                  return (
                    <button
                      key={
                        assignment.id ||
                        `${assignment.title}-${index}`
                      }
                      onClick={() => {
                        setSelected(assignment);
                        setAiResult(null);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-indigo-400/40 bg-indigo-500/[0.09] shadow-lg shadow-indigo-950/20"
                          : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-100">
                              {assignment.title}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pStyle.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${pStyle.dot}`}
                              />
                              {priority}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-medium text-indigo-300">
                            {assignment.subject || "General"}
                          </p>

                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                            {assignment.description ||
                              "No assignment description available."}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(assignment.dueDate)}
                            </span>

                            <span
                              className={`rounded-full border px-2 py-0.5 ${statusStyle(
                                assignment.status
                              )}`}
                            >
                              {assignment.status || "PENDING"}
                            </span>

                            <span>
                              {getDeadlineText(assignment.dueDate)}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-slate-600" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI panel */}
          <div className="rounded-3xl border border-indigo-400/15 bg-gradient-to-b from-indigo-500/[0.08] to-white/[0.025] p-5 shadow-2xl shadow-indigo-950/20 sm:p-6">
{selected ? (
              <>
                <div className="mb-5">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                    <Brain className="h-6 w-6" />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                    AI Workspace
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    {selected.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selected.subject || "General Assignment"}
                  </p>
                </div>

                <div className="mb-5 rounded-2xl border border-white/8 bg-black/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Deadline
                    </span>

                    <span className="text-xs font-semibold text-slate-300">
                      {formatDate(selected.dueDate)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Priority
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        priorityStyle(
                          getPriority(selected)
                        ).badge
                      }`}
                    >
                      {getPriority(selected)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Time status
                    </span>

                    <span className="text-xs font-medium text-slate-300">
                      {getDeadlineText(selected.dueDate)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                  <AIButton
                    icon={<Brain className="h-4 w-4" />}
                    label="Explain Assignment"
                    description="Understand what to do"
                    onClick={() => runAI("explain")}
                    loading={aiLoading}
                  />

                  <AIButton
                    icon={<Target className="h-4 w-4" />}
                    label="Task Breakdown"
                    description="Convert it into simple steps"
                    onClick={() => runAI("breakdown")}
                    loading={aiLoading}
                  />

                  <AIButton
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Smart Study Plan"
                    description="Create a practical work schedule"
                    onClick={() => runAI("plan")}
                    loading={aiLoading}
                  />

                  <AIButton
                    icon={<AlertCircle className="h-4 w-4" />}
                    label="Check Priority"
                    description="Find how urgent it is"
                    onClick={() => runAI("priority")}
                    loading={aiLoading}
                  />

                  <AIButton
                    icon={<Lightbulb className="h-4 w-4" />}
                    label="AI Recommendations"
                    description="Tips and submission checklist"
                    onClick={() => runAI("recommend")}
                    loading={aiLoading}
                  />
                </div>

                {aiResult && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-indigo-400/20 bg-[#070b18]">
                    <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-300" />
                        <span className="text-sm font-semibold">
                          CampusMind AI
                        </span>
                      </div>

                      <button
                        onClick={() => setAiResult(null)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200"
                        aria-label="Close AI result"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-slate-300">
                      {aiResult.answer}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <Brain className="h-12 w-12 text-indigo-400/50" />
                <h2 className="mt-4 text-lg font-semibold">
                  Select an assignment
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Choose an assignment from the list to unlock CampusMind AI
                  tools.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom information */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<Brain className="h-5 w-5" />}
            title="AI Explanation"
            text="Turn complex assignment requirements into simple student-friendly language."
          />

          <InfoCard
            icon={<Target className="h-5 w-5" />}
            title="Smart Priorities"
            text="Identify urgent assignments based on deadlines and current status."
          />

          <InfoCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Better Planning"
            text="Generate practical study sessions so you can finish work on time."
          />
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
          {icon}
        </div>

        <span className="text-2xl font-bold">{value}</span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-300">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-600">{detail}</p>
    </div>
  );
}

function AIButton({
  icon,
  label,
  description,
  onClick,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3 text-left transition hover:border-indigo-400/25 hover:bg-indigo-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300 transition group-hover:bg-indigo-500/15">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-200">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-slate-600">
          {description}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-700 transition group-hover:text-indigo-300" />
    </button>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}



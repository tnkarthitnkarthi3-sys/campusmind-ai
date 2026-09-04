"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  Plus,
  Target,
  Trash2,
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type StudySession = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  createdAt: string;
};

type Summary = {
  total: number;
  weeklyHours: number;
  weeklyGoalHours: number;
  weeklyPercentage: number;
  remainingHours: number;
  completedThisWeek: number;
  todayCount: number;
  upcomingCount: number;
};

const emptyForm = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDuration(start: string, end: string) {
  const hours =
    (new Date(end).getTime() - new Date(start).getTime()) /
    (1000 * 60 * 60);

  return Math.max(0, hours);
}

function toDateInput(value: string) {
  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toTimeInput(value: string) {
  const date = new Date(value);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export default function PlannerPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [selectedDate, setSelectedDate] = useState(new Date());

  async function loadPlanner() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/study-sessions", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load planner");
      }

      setSessions(data.sessions || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load planner"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlanner();
  }, []);

  const selectedDaySessions = useMemo(() => {
    return sessions
      .filter((session) => {
        const sessionDate = new Date(session.startTime);

        return (
          sessionDate.getFullYear() === selectedDate.getFullYear() &&
          sessionDate.getMonth() === selectedDate.getMonth() &&
          sessionDate.getDate() === selectedDate.getDate()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime()
      );
  }, [sessions, selectedDate]);

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          new Date(session.startTime) >= new Date() &&
          !session.completed
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime()
      )
      .slice(0, 5);
  }, [sessions]);

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.completed),
    [sessions]
  );

  function openAddModal() {
    const date = selectedDate;
    const dateValue = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    setEditingId(null);

    setForm({
      title: "",
      date: dateValue,
      startTime: "09:00",
      endTime: "10:00",
    });

    setShowModal(true);
  }

  function openEditModal(session: StudySession) {
    setEditingId(session.id);

    setForm({
      title: session.title,
      date: toDateInput(session.startTime),
      startTime: toTimeInput(session.startTime),
      endTime: toTimeInput(session.endTime),
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveSession() {
    if (!form.title.trim()) {
      setError("Please enter a study session title.");
      return;
    }

    if (!form.date || !form.startTime || !form.endTime) {
      setError("Please complete the date and time fields.");
      return;
    }

    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);

    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };

      const response = await fetch("/api/study-sessions", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? {
                id: editingId,
                ...payload,
                completed:
                  sessions.find((item) => item.id === editingId)
                    ?.completed ?? false,
              }
            : payload
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save study session");
      }

      closeModal();
      await loadPlanner();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save study session"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleComplete(session: StudySession) {
    try {
      setError("");

      const response = await fetch("/api/study-sessions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: session.id,
          title: session.title,
          startTime: session.startTime,
          endTime: session.endTime,
          completed: !session.completed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update session");
      }

      await loadPlanner();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update session"
      );
    }
  }

  async function deleteSession(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this study session?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/study-sessions?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete session");
      }

      await loadPlanner();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete session"
      );
    }
  }

  function moveDate(direction: number) {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + direction);
      return next;
    });
  }

  function goToday() {
    setSelectedDate(new Date());
  }

  const goalPercentage = summary?.weeklyPercentage ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <CalendarDays className="h-4 w-4" />
              Academic Planner
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Study Planner
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Organize your study sessions, stay consistent, and achieve your
              weekly academic goals.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Study Session
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Weekly Study Hours"
            value={summary ? `${summary.weeklyHours}h` : "--"}
            helper="Completed this week"
          />

          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Weekly Goal"
            value={summary ? `${summary.weeklyGoalHours}h` : "--"}
            helper={`${goalPercentage}% achieved`}
          />

          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Upcoming Sessions"
            value={summary ? String(summary.upcomingCount) : "--"}
            helper="Scheduled sessions"
          />

          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completed"
            value={summary ? String(summary.completedThisWeek) : "--"}
            helper="Sessions this week"
          />
        </section>

        {/* Goal */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <h2 className="font-semibold text-slate-900">
                  Weekly Study Goal
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {summary
                  ? summary.remainingHours > 0
                    ? `${summary.remainingHours} hours remaining to reach your 20-hour goal.`
                    : "Excellent! You have reached your weekly study goal."
                  : "Loading your weekly progress..."}
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold text-slate-950">
                {goalPercentage}%
              </span>
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${Math.min(100, goalPercentage)}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-500">
            <span>{summary?.weeklyHours ?? 0} hours completed</span>
            <span>{summary?.weeklyGoalHours ?? 20} hours goal</span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* Calendar / Day */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Daily Schedule
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {selectedDate.toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveDate(-1)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={goToday}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Today
                  </button>

                  <button
                    onClick={() => moveDate(1)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                </div>
              ) : selectedDaySessions.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <div className="mb-4 rounded-full bg-indigo-50 p-4">
                    <BookOpen className="h-7 w-7 text-indigo-600" />
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    No study sessions planned
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Create a focused study session for this day and keep your
                    academic progress on track.
                  </p>

                  <button
                    onClick={openAddModal}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDaySessions.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      onComplete={() => toggleComplete(session)}
                      onEdit={() => openEditModal(session)}
                      onDelete={() => deleteSession(session.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Right column */}
          <div className="space-y-6">

            {/* Upcoming */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      Upcoming Sessions
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Your next planned study blocks
                    </p>
                  </div>

                  <Clock3 className="h-5 w-5 text-indigo-600" />
                </div>
              </div>

              <div className="p-5">
                {upcomingSessions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No upcoming study sessions.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {session.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(session.startTime)}
                            </p>

                            <p className="mt-1 text-xs font-medium text-indigo-600">
                              {formatTime(session.startTime)} –{" "}
                              {formatTime(session.endTime)}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            {getDuration(
                              session.startTime,
                              session.endTime
                            ).toFixed(1)}
                            h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Recent completed */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="font-bold text-slate-950">
                  Completed Sessions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your recent academic progress
                </p>
              </div>

              <div className="p-5">
                {completedSessions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No completed sessions yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {completedSessions
                      .slice(-5)
                      .reverse()
                      .map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                        >
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {session.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(session.startTime)}
                            </p>
                          </div>

                          <span className="text-xs font-semibold text-emerald-600">
                            Done
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-950">
                  {editingId ? "Edit Study Session" : "Add Study Session"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Plan your focused academic study time.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Study Session
                </label>

                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder="e.g. Database Management Revision"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Date
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date: event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Time
                  </label>

                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        startTime: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    End Time
                  </label>

                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        endTime: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {form.startTime && form.endTime && (
                <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                  Planned duration:{" "}
                  <strong>
                    {getDuration(
                      `${form.date}T${form.startTime}`,
                      `${form.date}T${form.endTime}`
                    ).toFixed(1)}{" "}
                    hours
                  </strong>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveSession}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingId ? "Save Changes" : "Create Session"}
                </button>
              </div>
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
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{helper}</p>
    </div>
  );
}

function SessionRow({
  session,
  onComplete,
  onEdit,
  onDelete,
}: {
  session: StudySession;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const duration = getDuration(session.startTime, session.endTime);

  return (
    <div
      className={`group rounded-xl border p-4 transition ${
        session.completed
          ? "border-emerald-100 bg-emerald-50/40"
          : "border-slate-100 bg-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30"
      }`}
    >
      <div className="flex items-start gap-3">

        <button
          onClick={onComplete}
          title={
            session.completed
              ? "Mark as incomplete"
              : "Mark as completed"
          }
          className={`mt-0.5 shrink-0 rounded-full ${
            session.completed
              ? "text-emerald-500"
              : "text-slate-300 hover:text-indigo-500"
          }`}
        >
          <CheckCircle2 className="h-6 w-6" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3
              className={`font-semibold ${
                session.completed
                  ? "text-slate-500 line-through"
                  : "text-slate-900"
              }`}
            >
              {session.title}
            </h3>

            <span className="text-sm font-semibold text-indigo-600">
              {duration.toFixed(1)}h
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {formatTime(session.startTime)} –{" "}
              {formatTime(session.endTime)}
            </span>

            {session.completed && (
              <span className="font-semibold text-emerald-600">
                Completed
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <button
            onClick={onEdit}
            title="Edit"
            className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-indigo-600"
          >
            <Edit3 className="h-4 w-4" />
          </button>

          <button
            onClick={onDelete}
            title="Delete"
            className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

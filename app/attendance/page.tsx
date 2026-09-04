"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  LayoutDashboard,
  Menu,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type AttendanceRecord = {
  id: string;
  subject: string;
  date: string;
  present: boolean;
};

type SubjectSummary = {
  name: string;
  present: number;
  total: number;
  percentage: number;
  status: string;
};

type AttendanceResponse = {
  success: boolean;
  summary: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
    requiredMinimum: number;
  };
  subjects: SubjectSummary[];
  records: AttendanceRecord[];
};

const defaultForm = {
  subject: "",
  date: new Date().toISOString().slice(0, 10),
  present: true,
};

export default function AttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("Semester 5");

  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

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
      icon: Clock3,
    },
    {
      label: "Notes",
      href: "/notes",
      icon: BookOpen,
    },
  ];

  async function loadAttendance() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/attendance", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load attendance");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load attendance"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendance();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm({
      ...defaultForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  }

  function openEditModal(record: AttendanceRecord) {
    setEditingId(record.id);

    setForm({
      subject: record.subject,
      date: record.date.slice(0, 10),
      present: record.present,
    });

    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/attendance", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          subject: form.subject,
          date: new Date(`${form.date}T09:00:00`).toISOString(),
          present: form.present,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to save attendance"
        );
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(defaultForm);

      await loadAttendance();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save attendance"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this attendance record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/attendance?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete attendance"
        );
      }

      await loadAttendance();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete attendance"
      );
    }
  }

  const summary = data?.summary ?? {
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
    requiredMinimum: 75,
  };

  const health = useMemo(() => {
    if (summary.percentage >= 90) {
      return {
        label: "Excellent",
        description:
          "Your attendance is healthy. Keep maintaining this consistency.",
      };
    }

    if (summary.percentage >= 75) {
      return {
        label: "Good",
        description:
          "You are above the minimum requirement, but regular attendance is recommended.",
      };
    }

    return {
      label: "Needs attention",
      description:
        "Your attendance is below the required minimum. Try to attend upcoming classes regularly.",
    };
  }, [summary.percentage]);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  function formatTime(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

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

        <div className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.label === "Attendance";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    size={19}
                    className={
                      active
                        ? "text-cyan-300"
                        : "text-slate-400"
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

      <div className="lg:pl-72">
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
                  <span>Attendance</span>
                </div>

                <h1 className="mt-1 text-xl font-bold tracking-tight">
                  Attendance
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold outline-none focus:border-indigo-500"
                >
                  <option>Semester 5</option>
                  <option>Semester 4</option>
                  <option>Semester 3</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white">
                RK
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">
          <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                <CalendarDays size={14} />
                {semester}
              </div>

              <h2 className="text-3xl font-bold tracking-tight">
                Your attendance overview
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track your classes, update attendance records, and
                stay above the required attendance percentage.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Add Attendance
            </button>
          </section>

          {error && (
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
          ) : (
            <>
              <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  icon={<Activity size={20} />}
                  iconClass="bg-indigo-50 text-indigo-600"
                  title="Overall Attendance"
                  value={`${summary.percentage}%`}
                  description={`${summary.present} of ${summary.total} classes attended`}
                />

                <SummaryCard
                  icon={<CheckCircle2 size={20} />}
                  iconClass="bg-emerald-50 text-emerald-600"
                  title="Classes Present"
                  value={String(summary.present)}
                  description="Attendance recorded"
                />

                <SummaryCard
                  icon={<XCircle size={20} />}
                  iconClass="bg-red-50 text-red-600"
                  title="Classes Absent"
                  value={String(summary.absent)}
                  description={
                    summary.total
                      ? `${Math.round(
                          (summary.absent / summary.total) * 100
                        )}% of total classes`
                      : "No classes recorded"
                  }
                />

                <SummaryCard
                  icon={<TargetIcon />}
                  iconClass="bg-amber-50 text-amber-600"
                  title="Required Minimum"
                  value={`${summary.requiredMinimum}%`}
                  description={
                    summary.percentage >= summary.requiredMinimum
                      ? `You are ${
                          summary.percentage -
                          summary.requiredMinimum
                        }% above minimum`
                      : `You are ${
                          summary.requiredMinimum -
                          summary.percentage
                        }% below minimum`
                  }
                  descriptionClass={
                    summary.percentage >= summary.requiredMinimum
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                />
              </section>

              <section className="mt-7 grid gap-7 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                      <h3 className="font-bold">
                        Subject Attendance
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Calculated directly from your attendance records
                      </p>
                    </div>
                  </div>

                  {data?.subjects.length ? (
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-4 py-4">Classes</th>
                            <th className="px-4 py-4">Attendance</th>
                            <th className="px-6 py-4">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {data.subjects.map((subject) => (
                            <tr
                              key={subject.name}
                              className="transition hover:bg-slate-50"
                            >
                              <td className="px-6 py-5">
                                <p className="text-sm font-bold">
                                  {subject.name}
                                </p>
                              </td>

                              <td className="px-4 py-5">
                                <p className="text-sm font-semibold">
                                  {subject.present} / {subject.total}
                                </p>
                              </td>

                              <td className="min-w-[200px] px-4 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className={`h-full rounded-full ${
                                        subject.percentage >= 90
                                          ? "bg-emerald-500"
                                          : subject.percentage >= 75
                                            ? "bg-indigo-500"
                                            : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${subject.percentage}%`,
                                      }}
                                    />
                                  </div>

                                  <span className="text-sm font-bold">
                                    {subject.percentage}%
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                                    subject.status === "Excellent"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : subject.status === "Good"
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "bg-amber-50 text-amber-600"
                                  }`}
                                >
                                  {subject.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState onAdd={openAddModal} />
                  )}

                  <div className="divide-y divide-slate-100 md:hidden">
                    {data?.subjects.map((subject) => (
                      <div
                        key={subject.name}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold">
                              {subject.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {subject.present} / {subject.total} classes
                            </p>
                          </div>

                          <span className="text-lg font-bold">
                            {subject.percentage}%
                          </span>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              subject.percentage >= 90
                                ? "bg-emerald-500"
                                : subject.percentage >= 75
                                  ? "bg-indigo-500"
                                  : "bg-red-500"
                            }`}
                            style={{
                              width: `${subject.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <h3 className="font-bold">
                      Attendance Health
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Your current academic standing
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-center py-4">
                      <div
                        className="relative flex h-48 w-48 items-center justify-center rounded-full"
                        style={{
                          background: `conic-gradient(#10b981 ${summary.percentage}%, #e2e8f0 ${summary.percentage}% 100%)`,
                        }}
                      >
                        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
                          <p className="text-4xl font-bold">
                            {summary.percentage}%
                          </p>

                          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                            {health.label}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            size={18}
                            className="text-emerald-600"
                          />
                          <span className="text-sm font-semibold text-emerald-900">
                            Above 90%
                          </span>
                        </div>

                        <span className="text-xs font-bold text-emerald-600">
                          {data?.subjects.filter(
                            (subject) => subject.percentage >= 90
                          ).length ?? 0}{" "}
                          subjects
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp
                            size={18}
                            className="text-indigo-600"
                          />
                          <span className="text-sm font-semibold text-indigo-900">
                            75% - 89%
                          </span>
                        </div>

                        <span className="text-xs font-bold text-indigo-600">
                          {data?.subjects.filter(
                            (subject) =>
                              subject.percentage >= 75 &&
                              subject.percentage < 90
                          ).length ?? 0}{" "}
                          subjects
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">
                        <div className="flex items-center gap-3">
                          <XCircle
                            size={18}
                            className="text-red-600"
                          />
                          <span className="text-sm font-semibold text-red-900">
                            Below 75%
                          </span>
                        </div>

                        <span className="text-xs font-bold text-red-600">
                          {data?.subjects.filter(
                            (subject) => subject.percentage < 75
                          ).length ?? 0}{" "}
                          subjects
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                      <p className="text-sm font-bold text-indigo-950">
                        AI Recommendation
                      </p>

                      <p className="mt-2 text-xs leading-5 text-indigo-700">
                        {health.description}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <h3 className="font-bold">
                      Recent Attendance
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Latest attendance records from your account
                    </p>
                  </div>

                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>

                {data?.records.length ? (
                  <div className="divide-y divide-slate-100">
                    {data.records.slice(0, 10).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center gap-4 px-6 py-4"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            record.present
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {record.present ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <XCircle size={18} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">
                            {record.subject}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(record.date)} •{" "}
                            {formatTime(record.date)}
                          </p>
                        </div>

                        <span
                          className={`hidden rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex ${
                            record.present
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {record.present ? "Present" : "Absent"}
                        </span>

                        <button
                          onClick={() => openEditModal(record)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(record.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState onAdd={openAddModal} />
                )}
              </section>

              <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 sm:flex-row">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 size={15} />
                  Live data from CampusMind database
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <ArrowLeft size={16} />
                  Back to Dashboard
                </Link>
              </div>
            </>
          )}
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold">
                  {editingId
                    ? "Edit Attendance"
                    : "Add Attendance"}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {editingId
                    ? "Update this attendance record."
                    : "Record today's class attendance."}
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Subject
                </label>

                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subject: e.target.value,
                    })
                  }
                  placeholder="e.g. Data Structures"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Date
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Attendance Status
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        present: true,
                      })
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      form.present
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle2
                      size={17}
                      className="mx-auto mb-1"
                    />
                    Present
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        present: false,
                      })
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      !form.present
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <XCircle
                      size={17}
                      className="mx-auto mb-1"
                    />
                    Absent
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Attendance"
                      : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  iconClass,
  title,
  value,
  description,
  descriptionClass = "text-slate-400",
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  value: string;
  description: string;
  descriptionClass?: string;
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

      <p className="mt-1 text-3xl font-bold">{value}</p>

      <p className={`mt-1 text-xs font-semibold ${descriptionClass}`}>
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <CalendarDays size={22} />
      </div>

      <h3 className="mt-4 font-bold">
        No attendance records yet
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
        Start recording your classes to see attendance percentages
        and subject-wise insights here.
      </p>

      <button
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
      >
        <Plus size={16} />
        Add First Record
      </button>
    </div>
  );
}

function TargetIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

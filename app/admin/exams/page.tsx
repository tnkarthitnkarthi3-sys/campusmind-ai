"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
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

type Exam = {
  id: string;
  title: string;
  examType: string;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  venue: string | null;
  totalMarks: number;
  passingMarks: number;
  instructions: string | null;
  active: boolean;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  department: Department | null;
  course: Course | null;
  semester: Semester | null;
  subject: Subject | null;
};

const emptyForm = {
  title: "",
  examType: "INTERNAL",
  examDate: "",
  startTime: "09:00",
  endTime: "10:30",
  duration: 90,
  venue: "",
  totalMarks: 100,
  passingMarks: 40,
  instructions: "",
  active: true,
  departmentId: "",
  courseId: "",
  semesterId: "",
  subjectId: "",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/exams", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load exams");
      }

      setExams(data.exams || []);
      setDepartments(data.departments || []);
      setCourses(data.courses || []);
      setSemesters(data.semesters || []);
      setSubjects(data.subjects || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load exams"
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
        (item) => item.departmentId === form.departmentId
      ),
    [courses, form.departmentId]
  );

  const filteredSemesters = useMemo(
    () =>
      semesters.filter(
        (item) => item.courseId === form.courseId
      ),
    [semesters, form.courseId]
  );

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (item) =>
          item.courseId === form.courseId &&
          item.semesterId === form.semesterId
      ),
    [subjects, form.courseId, form.semesterId]
  );

  const visibleExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        !query ||
        exam.title.toLowerCase().includes(query) ||
        exam.examType.toLowerCase().includes(query) ||
        exam.subject?.name.toLowerCase().includes(query) ||
        exam.subject?.code.toLowerCase().includes(query) ||
        exam.course?.name.toLowerCase().includes(query) ||
        exam.department?.name.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "ALL" || exam.examType === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && exam.active) ||
        (statusFilter === "INACTIVE" && !exam.active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [exams, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = exams.filter((x) => x.active);
    const uniqueSubjects = new Set(
      exams.map((x) => x.subjectId)
    );

    const uniqueVenues = new Set(
      exams
        .map((x) => x.venue?.trim())
        .filter(Boolean)
    );

    return {
      total: exams.length,
      active: active.length,
      subjects: uniqueSubjects.size,
      venues: uniqueVenues.size,
    };
  }, [exams]);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      examDate: new Date().toISOString().slice(0, 10),
    });
    setError("");
    setModalOpen(true);
  }

  function openEdit(exam: Exam) {
    setEditing(exam);

    setForm({
      title: exam.title,
      examType: exam.examType,
      examDate: exam.examDate.slice(0, 10),
      startTime: exam.startTime,
      endTime: exam.endTime,
      duration: exam.duration,
      venue: exam.venue || "",
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      instructions: exam.instructions || "",
      active: exam.active,
      departmentId: exam.departmentId,
      courseId: exam.courseId,
      semesterId: exam.semesterId,
      subjectId: exam.subjectId,
    });

    setError("");
    setModalOpen(true);
  }

  function updateForm(
    key: keyof typeof emptyForm,
    value: string | number | boolean
  ) {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "departmentId") {
        next.courseId = "";
        next.semesterId = "";
        next.subjectId = "";
      }

      if (key === "courseId") {
        next.semesterId = "";
        next.subjectId = "";
      }

      if (key === "semesterId") {
        next.subjectId = "";
      }

      return next;
    });
  }

  async function saveExam(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/admin/exams", {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editing
            ? { ...form, id: editing.id }
            : form
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save exam");
      }

      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save exam"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteExam(exam: Exam) {
    const confirmed = window.confirm(
      `Delete "${exam.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/exams?id=${encodeURIComponent(exam.id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete exam");
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete exam"
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <CalendarDays size={17} />
              Academic Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Exams
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage official examinations across every department,
              course, semester and subject.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Create Exam
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={20} />
            </div>
            <p className="text-sm text-slate-500">Total Exams</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-sm text-slate-500">Active Exams</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stats.active}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FileText size={20} />
            </div>
            <p className="text-sm text-slate-500">Subjects Covered</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stats.subjects}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <MapPin size={20} />
            </div>
            <p className="text-sm text-slate-500">Venues Used</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stats.venues}
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exams, subjects, courses..."
                className="input pl-10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input lg:w-48"
            >
              <option value="ALL">All Types</option>
              <option value="INTERNAL">Internal</option>
              <option value="MODEL">Model</option>
              <option value="PRACTICAL">Practical</option>
              <option value="SEMESTER">Semester</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input lg:w-44"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Exam
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date & Time
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Course / Semester
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subject
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Venue
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      Loading exams...
                    </td>
                  </tr>
                ) : visibleExams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <CalendarDays size={22} />
                      </div>

                      <p className="font-semibold text-slate-900">
                        No exams found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Create an official exam to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  visibleExams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {exam.title}
                        </div>

                        <span className="mt-1 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                          {exam.examType}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {formatDate(exam.examDate)}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 size={13} />
                          {exam.startTime} - {exam.endTime}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {exam.department?.name || "-"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {exam.department?.code || ""}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {exam.course?.name || "-"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {exam.semester?.name || ""}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {exam.subject?.name || "-"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {exam.subject?.code || ""}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                          <MapPin size={14} />
                          {exam.venue || "Not assigned"}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {exam.duration} minutes
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            exam.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {exam.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(exam)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => deleteExam(exam)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editing ? "Edit Exam" : "Create Exam"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure official examination details.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveExam}
              className="space-y-6 p-6"
            >
              <section>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Exam Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="label">
                      Exam Title
                    </label>

                    <input
                      required
                      value={form.title}
                      onChange={(e) =>
                        updateForm("title", e.target.value)
                      }
                      className="input"
                      placeholder="e.g. Data Structures Internal Assessment 1"
                    />
                  </div>

                  <div>
                    <label className="label">
                      Exam Type
                    </label>

                    <select
                      value={form.examType}
                      onChange={(e) =>
                        updateForm("examType", e.target.value)
                      }
                      className="input"
                    >
                      <option value="INTERNAL">Internal</option>
                      <option value="MODEL">Model</option>
                      <option value="PRACTICAL">Practical</option>
                      <option value="SEMESTER">Semester</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Exam Date
                    </label>

                    <input
                      required
                      type="date"
                      value={form.examDate}
                      onChange={(e) =>
                        updateForm("examDate", e.target.value)
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">
                      Start Time
                    </label>

                    <input
                      required
                      type="time"
                      value={form.startTime}
                      onChange={(e) =>
                        updateForm("startTime", e.target.value)
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">
                      End Time
                    </label>

                    <input
                      required
                      type="time"
                      value={form.endTime}
                      onChange={(e) =>
                        updateForm("endTime", e.target.value)
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">
                      Duration (minutes)
                    </label>

                    <input
                      required
                      type="number"
                      min={1}
                      value={form.duration}
                      onChange={(e) =>
                        updateForm(
                          "duration",
                          Number(e.target.value)
                        )
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">
                      Venue
                    </label>

                    <input
                      value={form.venue}
                      onChange={(e) =>
                        updateForm("venue", e.target.value)
                      }
                      className="input"
                      placeholder="e.g. Block A - Hall 201"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Academic Mapping
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="label">
                      Department
                    </label>

                    <select
                      required
                      value={form.departmentId}
                      onChange={(e) =>
                        updateForm(
                          "departmentId",
                          e.target.value
                        )
                      }
                      className="input"
                    >
                      <option value="">
                        Select Department
                      </option>

                      {departments.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Course
                    </label>

                    <select
                      required
                      disabled={!form.departmentId}
                      value={form.courseId}
                      onChange={(e) =>
                        updateForm("courseId", e.target.value)
                      }
                      className="input disabled:bg-slate-100"
                    >
                      <option value="">
                        Select Course
                      </option>

                      {filteredCourses.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Semester
                    </label>

                    <select
                      required
                      disabled={!form.courseId}
                      value={form.semesterId}
                      onChange={(e) =>
                        updateForm(
                          "semesterId",
                          e.target.value
                        )
                      }
                      className="input disabled:bg-slate-100"
                    >
                      <option value="">
                        Select Semester
                      </option>

                      {filteredSemesters.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Subject
                    </label>

                    <select
                      required
                      disabled={!form.semesterId}
                      value={form.subjectId}
                      onChange={(e) =>
                        updateForm(
                          "subjectId",
                          e.target.value
                        )
                      }
                      className="input disabled:bg-slate-100"
                    >
                      <option value="">
                        Select Subject
                      </option>

                      {filteredSubjects.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Marks & Instructions
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="label">
                      Total Marks
                    </label>

                    <input
                      required
                      type="number"
                      min={1}
                      value={form.totalMarks}
                      onChange={(e) =>
                        updateForm(
                          "totalMarks",
                          Number(e.target.value)
                        )
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">
                      Passing Marks
                    </label>

                    <input
                      required
                      type="number"
                      min={0}
                      value={form.passingMarks}
                      onChange={(e) =>
                        updateForm(
                          "passingMarks",
                          Number(e.target.value)
                        )
                      }
                      className="input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">
                      Instructions
                    </label>

                    <textarea
                      rows={4}
                      value={form.instructions}
                      onChange={(e) =>
                        updateForm(
                          "instructions",
                          e.target.value
                        )
                      }
                      className="input min-h-[100px] resize-y"
                      placeholder="Enter examination instructions..."
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        updateForm(
                          "active",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        Active Exam
                      </span>

                      <span className="block text-xs text-slate-500">
                        Students can see active official exams.
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Update Exam"
                      : "Create Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
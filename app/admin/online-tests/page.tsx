"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Edit3,
  FileQuestion,
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

type Test = {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  durationMin: number;
  totalMarks: number;
  passingMarks: number;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  shuffleQuestions: boolean;
  showResult: boolean;
  questionCount: number;
  department: Department | null;
  course: Course | null;
  semester: Semester | null;
  subject: Subject | null;
};

type FormState = {
  title: string;
  description: string;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  durationMin: string;
  totalMarks: string;
  passingMarks: string;
  startDate: string;
  endDate: string;
  active: boolean;
  shuffleQuestions: boolean;
  showResult: boolean;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  departmentId: "",
  courseId: "",
  semesterId: "",
  subjectId: "",
  durationMin: "30",
  totalMarks: "20",
  passingMarks: "8",
  startDate: "",
  endDate: "",
  active: true,
  shuffleQuestions: false,
  showResult: true,
};

function formatDate(value: string | null) {
  if (!value) return "No schedule";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatus(test: Test) {
  if (!test.active) return "Inactive";

  const now = new Date();

  if (test.endDate && new Date(test.endDate) < now) {
    return "Completed";
  }

  if (test.startDate && new Date(test.startDate) > now) {
    return "Scheduled";
  }

  return "Active";
}

export default function AdminOnlineTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/online-tests",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load online tests."
        );
      }

      setTests(data.tests || []);
      setDepartments(data.departments || []);
      setCourses(data.courses || []);
      setSemesters(data.semesters || []);
      setSubjects(data.subjects || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load online tests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const formCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          !form.departmentId ||
          course.departmentId === form.departmentId
      ),
    [courses, form.departmentId]
  );

  const formSemesters = useMemo(
    () =>
      semesters.filter(
        (semester) =>
          !form.courseId ||
          semester.courseId === form.courseId
      ),
    [semesters, form.courseId]
  );

  const formSubjects = useMemo(
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

  const filterCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          !departmentFilter ||
          course.departmentId === departmentFilter
      ),
    [courses, departmentFilter]
  );

  const filterSemesters = useMemo(
    () =>
      semesters.filter(
        (semester) =>
          !courseFilter ||
          semester.courseId === courseFilter
      ),
    [semesters, courseFilter]
  );

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesSearch =
        !query ||
        test.title.toLowerCase().includes(query) ||
        test.course?.name.toLowerCase().includes(query) ||
        test.subject?.name.toLowerCase().includes(query) ||
        test.subject?.code.toLowerCase().includes(query);

      const matchesDepartment =
        !departmentFilter ||
        test.departmentId === departmentFilter;

      const matchesCourse =
        !courseFilter ||
        test.courseId === courseFilter;

      const matchesSemester =
        !semesterFilter ||
        test.semesterId === semesterFilter;

      const status = getStatus(test);

      const matchesStatus =
        !statusFilter ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesCourse &&
        matchesSemester &&
        matchesStatus
      );
    });
  }, [
    tests,
    search,
    departmentFilter,
    courseFilter,
    semesterFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    const active = tests.filter(
      (test) => test.active
    ).length;

    const scheduled = tests.filter(
      (test) => getStatus(test) === "Scheduled"
    ).length;

    const questions = tests.reduce(
      (sum, test) => sum + test.questionCount,
      0
    );

    return {
      total: tests.length,
      active,
      scheduled,
      questions,
    };
  }, [tests]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function openCreate() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(test: Test) {
    setEditingId(test.id);

    setForm({
      title: test.title,
      description: test.description || "",
      departmentId: test.departmentId,
      courseId: test.courseId,
      semesterId: test.semesterId,
      subjectId: test.subjectId,
      durationMin: String(test.durationMin),
      totalMarks: String(test.totalMarks),
      passingMarks: String(test.passingMarks),
      startDate: test.startDate
        ? new Date(test.startDate)
            .toISOString()
            .slice(0, 16)
        : "",
      endDate: test.endDate
        ? new Date(test.endDate)
            .toISOString()
            .slice(0, 16)
        : "",
      active: test.active,
      shuffleQuestions: test.shuffleQuestions,
      showResult: test.showResult,
    });

    setError("");
    setModalOpen(true);
  }

  function updateForm(
    key: keyof FormState,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveTest() {
    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description:
          form.description.trim() || null,
        departmentId: form.departmentId,
        courseId: form.courseId,
        semesterId: form.semesterId,
        subjectId: form.subjectId,
        durationMin: Number(form.durationMin),
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
        startDate:
          form.startDate || null,
        endDate:
          form.endDate || null,
        active: form.active,
        shuffleQuestions:
          form.shuffleQuestions,
        showResult: form.showResult,
      };

      const response = await fetch(
        "/api/admin/online-tests",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            ...(editingId
              ? { id: editingId }
              : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save online test."
        );
      }

      setModalOpen(false);
      resetForm();

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save online test."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTest(id: string) {
    const confirmed = window.confirm(
      "Delete this online test and all its questions and attempts?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/online-tests?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete online test."
        );
      }

      await loadData();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete online test."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] p-6">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Admin
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200">
                <FileQuestion size={24} />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Online Tests
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Create and manage official academic online assessments.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Create Online Test
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<FileQuestion size={20} />}
            label="Total Tests"
            value={stats.total}
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Active Tests"
            value={stats.active}
          />

          <StatCard
            icon={<Clock3 size={20} />}
            label="Scheduled"
            value={stats.scheduled}
          />

          <StatCard
            icon={<BookOpen size={20} />}
            label="Total Questions"
            value={stats.questions}
          />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search tests, courses or subjects..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCourseFilter("");
                setSemesterFilter("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}
            </select>

            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setSemesterFilter("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Courses</option>
              {filterCourses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.name}
                </option>
              ))}
            </select>

            <select
              value={semesterFilter}
              onChange={(e) =>
                setSemesterFilter(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Semesters</option>
              {filterSemesters.map((semester) => (
                <option
                  key={semester.id}
                  value={semester.id}
                >
                  {semester.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error && !modalOpen && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Test
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Academic
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Questions
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Duration
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Marks
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Schedule
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
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
                      Loading online tests...
                    </td>
                  </tr>
                ) : filteredTests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <FileQuestion size={26} />
                      </div>

                      <p className="font-semibold text-slate-900">
                        No online tests found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Create an online test to start building assessments.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTests.map((test) => {
                    const status = getStatus(test);

                    return (
                      <tr
                        key={test.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="max-w-[280px]">
                            <div className="font-semibold text-slate-900">
                              {test.title}
                            </div>

                            {test.description && (
                              <div className="mt-1 truncate text-xs text-slate-500">
                                {test.description}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-800">
                            {test.subject?.name || "-"}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {test.course?.name || "-"} •{" "}
                            {test.semester?.name || "-"}
                          </div>

                          <div className="mt-1 text-xs font-medium text-indigo-600">
                            {test.department?.code || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                            {test.questionCount}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {test.durationMin} min
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-slate-900">
                            {test.totalMarks} marks
                          </div>

                          <div className="text-xs text-slate-500">
                            Pass: {test.passingMarks}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-800">
                            {formatDate(test.startDate)}
                          </div>

                          {test.endDate && (
                            <div className="mt-1 text-xs text-slate-500">
                              Until {formatDate(test.endDate)}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : status === "Scheduled"
                                ? "bg-blue-50 text-blue-700"
                                : status === "Completed"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/online-tests/${test.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                            >
                              <FileQuestion size={14} />
                              Questions
                            </Link>

                            <button
                              onClick={() =>
                                openEdit(test)
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() =>
                                deleteTest(test.id)
                              }
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Online Test"
                    : "Create Online Test"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure the academic assessment details.
                </p>
              </div>

              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              {error && (
                <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <Field
                label="Test Title"
                className="md:col-span-2"
              >
                <input
                  value={form.title}
                  onChange={(e) =>
                    updateForm("title", e.target.value)
                  }
                  placeholder="e.g. Data Structures Unit Test - 1"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Description"
                className="md:col-span-2"
              >
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateForm(
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Assessment instructions..."
                  className={inputClass}
                />
              </Field>

              <Field label="Department">
                <select
                  value={form.departmentId}
                  onChange={(e) => {
                    updateForm(
                      "departmentId",
                      e.target.value
                    );
                    updateForm("courseId", "");
                    updateForm("semesterId", "");
                    updateForm("subjectId", "");
                  }}
                  className={inputClass}
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name} ({department.code})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Course">
                <select
                  value={form.courseId}
                  onChange={(e) => {
                    updateForm(
                      "courseId",
                      e.target.value
                    );
                    updateForm("semesterId", "");
                    updateForm("subjectId", "");
                  }}
                  className={inputClass}
                >
                  <option value="">
                    Select Course
                  </option>

                  {formCourses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Semester">
                <select
                  value={form.semesterId}
                  onChange={(e) => {
                    updateForm(
                      "semesterId",
                      e.target.value
                    );
                    updateForm("subjectId", "");
                  }}
                  className={inputClass}
                >
                  <option value="">
                    Select Semester
                  </option>

                  {formSemesters.map((semester) => (
                    <option
                      key={semester.id}
                      value={semester.id}
                    >
                      {semester.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Subject">
                <select
                  value={form.subjectId}
                  onChange={(e) =>
                    updateForm(
                      "subjectId",
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Select Subject
                  </option>

                  {formSubjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Duration (minutes)">
                <input
                  type="number"
                  min="1"
                  max="600"
                  value={form.durationMin}
                  onChange={(e) =>
                    updateForm(
                      "durationMin",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Total Marks">
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={form.totalMarks}
                  onChange={(e) =>
                    updateForm(
                      "totalMarks",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Passing Marks">
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={form.passingMarks}
                  onChange={(e) =>
                    updateForm(
                      "passingMarks",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Start Date & Time">
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) =>
                    updateForm(
                      "startDate",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="End Date & Time">
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) =>
                    updateForm(
                      "endDate",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <div className="md:col-span-2 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
                <Toggle
                  label="Active Test"
                  checked={form.active}
                  onChange={(value) =>
                    updateForm("active", value)
                  }
                />

                <Toggle
                  label="Shuffle Questions"
                  checked={form.shuffleQuestions}
                  onChange={(value) =>
                    updateForm(
                      "shuffleQuestions",
                      value
                    )
                  }
                />

                <Toggle
                  label="Show Result"
                  checked={form.showResult}
                  onChange={(value) =>
                    updateForm(
                      "showResult",
                      value
                    )
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveTest}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Test"
                  : "Create Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

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
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
      />

      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>
    </label>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </div>
      </div>

      <div className="text-3xl font-bold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-500">
        {label}
      </div>
    </div>
  );
}
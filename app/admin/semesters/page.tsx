"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Layers3,
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  BookOpen,
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
  department: Department;
};

type Semester = {
  id: string;
  name: string;
  number: number;
  active: boolean;
  course: Course;
  _count: {
    users: number;
    subjects: number;
  };
};

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);

  const [form, setForm] = useState({
    name: "",
    number: 1,
    courseId: "",
    active: true,
  });

  async function loadData() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/semesters",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load semesters"
        );
      }

      setSemesters(data.semesters || []);
      setCourses(data.courses || []);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load semesters"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredSemesters = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return semesters;
    }

    return semesters.filter((semester) => {
      return (
        semester.name.toLowerCase().includes(query) ||
        semester.course.name
          .toLowerCase()
          .includes(query) ||
        semester.course.code
          .toLowerCase()
          .includes(query) ||
        semester.course.department.name
          .toLowerCase()
          .includes(query) ||
        semester.course.department.code
          .toLowerCase()
          .includes(query)
      );
    });
  }, [semesters, search]);

  function openCreate() {
    setEditing(null);

    setForm({
      name: "Semester 1",
      number: 1,
      courseId: courses[0]?.id || "",
      active: true,
    });

    setShowModal(true);
  }

  function openEdit(semester: Semester) {
    setEditing(semester);

    setForm({
      name: semester.name,
      number: semester.number,
      courseId: semester.course.id,
      active: semester.active,
    });

    setShowModal(true);
  }

  async function saveSemester() {
    if (!form.name.trim()) {
      alert("Semester name is required.");
      return;
    }

    if (!form.courseId) {
      alert("Please select a course.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/semesters",
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(editing
              ? {
                  id: editing.id,
                }
              : {}),
            ...form,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save semester"
        );
      }

      setShowModal(false);

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save semester"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSemester(semester: Semester) {
    const confirmed = window.confirm(
      `Delete "${semester.name}" from "${semester.course.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/semesters?id=${semester.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete semester"
        );
      }

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete semester"
      );
    }
  }

  const totalStudents = semesters.reduce(
    (total, semester) =>
      total + semester._count.users,
    0
  );

  const totalSubjects = semesters.reduce(
    (total, semester) =>
      total + semester._count.subjects,
    0
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Semesters
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage semesters across all academic courses.
            </p>
          </div>

          <button
            onClick={openCreate}
            disabled={courses.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add Semester
          </button>
        </div>

        {/* STATS */}
        <div className="mb-7 grid gap-4 md:grid-cols-3">

          <Stat
            icon={<Layers3 size={20} />}
            label="Total Semesters"
            value={semesters.length}
          />

          <Stat
            icon={<Users size={20} />}
            label="Students"
            value={totalStudents}
          />

          <Stat
            icon={<BookOpen size={20} />}
            label="Subjects"
            value={totalSubjects}
          />

        </div>

        {/* SEARCH */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search semesters, courses or departments..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead className="border-b border-slate-100 bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                  <th className="px-6 py-4">
                    Semester
                  </th>

                  <th className="px-6 py-4">
                    Course
                  </th>

                  <th className="px-6 py-4">
                    Department
                  </th>

                  <th className="px-6 py-4">
                    Students
                  </th>

                  <th className="px-6 py-4">
                    Subjects
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      Loading semesters...
                    </td>
                  </tr>
                ) : filteredSemesters.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center"
                    >
                      <Layers3
                        size={40}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="font-semibold text-slate-700">
                        No semesters found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Create a course first, then add semesters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSemesters.map((semester) => (
                    <tr
                      key={semester.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Layers3 size={18} />
                          </div>

                          <div>
                            <div className="font-semibold text-slate-900">
                              {semester.name}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              Semester {semester.number}
                            </div>
                          </div>

                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-800">
                          {semester.course.name}
                        </div>

                        <div className="mt-1 text-xs font-bold text-blue-600">
                          {semester.course.code}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="font-medium text-slate-800">
                          {semester.course.department.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {semester.course.department.code}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                        {semester._count.users}
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                        {semester._count.subjects}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            semester.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {semester.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEdit(semester)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() =>
                              deleteSemester(semester)
                            }
                            className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50"
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="border-b border-slate-100 p-6">

              <h2 className="text-lg font-bold text-slate-900">
                {editing
                  ? "Edit Semester"
                  : "Create Semester"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure the semester under an academic course.
              </p>

            </div>

            <div className="space-y-5 p-6">

              {/* COURSE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Course
                </label>

                <select
                  value={form.courseId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      courseId:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="">
                    Select Course
                  </option>

                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.name} — {course.code}
                    </option>
                  ))}

                </select>
              </div>

              {/* NUMBER */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Semester Number
                </label>

                <select
                  value={form.number}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      number: Number(
                        event.target.value
                      ),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  {Array.from(
                    { length: 12 },
                    (_, index) => index + 1
                  ).map((number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      Semester {number}
                    </option>
                  ))}

                </select>
              </div>

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Semester Name
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Semester 1"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ACTIVE */}
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">

                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      active:
                        event.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded"
                />

                Active Semester

              </label>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveSemester}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update Semester"
                    : "Create Semester"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function Stat({
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

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div className="text-2xl font-bold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-xs font-medium text-slate-500">
        {label}
      </div>

    </div>
  );
}
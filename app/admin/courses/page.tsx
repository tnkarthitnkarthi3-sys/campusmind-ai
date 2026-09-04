"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Layers3,
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
  durationYears: number;
  active: boolean;
  department: Department;
  _count: {
    users: number;
    semesters: number;
    subjects: number;
  };
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    durationYears: 4,
    departmentId: "",
    active: true,
  });

  async function loadCourses() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/courses", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load courses"
        );
      }

      setCourses(data.courses || []);
      setDepartments(data.departments || []);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const value = search.toLowerCase().trim();

    if (!value) return true;

    return (
      course.name.toLowerCase().includes(value) ||
      course.code.toLowerCase().includes(value) ||
      course.department.name.toLowerCase().includes(value)
    );
  });

  function openCreate() {
    setEditing(null);

    setForm({
      name: "",
      code: "",
      durationYears: 4,
      departmentId: departments[0]?.id || "",
      active: true,
    });

    setShowModal(true);
  }

  function openEdit(course: Course) {
    setEditing(course);

    setForm({
      name: course.name,
      code: course.code,
      durationYears: course.durationYears,
      departmentId: course.department.id,
      active: course.active,
    });

    setShowModal(true);
  }

  async function saveCourse() {
    if (!form.name.trim()) {
      alert("Course name is required.");
      return;
    }

    if (!form.code.trim()) {
      alert("Course code is required.");
      return;
    }

    if (!form.departmentId) {
      alert("Please select a department.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/courses", {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editing ? { id: editing.id } : {}),
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save course"
        );
      }

      setShowModal(false);
      await loadCourses();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save course"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse(course: Course) {
    if (
      !window.confirm(
        `Delete "${course.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/courses?id=${course.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete course"
        );
      }

      await loadCourses();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete course"
      );
    }
  }

  const totalStudents = courses.reduce(
    (sum, course) => sum + course._count.users,
    0
  );

  const totalSemesters = courses.reduce(
    (sum, course) => sum + course._count.semesters,
    0
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">

        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Courses
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage academic courses across all departments.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Course
          </button>
        </div>

        <div className="mb-7 grid gap-4 md:grid-cols-3">
          <Stat
            icon={<BookOpen size={20} />}
            label="Total Courses"
            value={courses.length}
          />

          <Stat
            icon={<Users size={20} />}
            label="Students Enrolled"
            value={totalStudents}
          />

          <Stat
            icon={<Layers3 size={20} />}
            label="Total Semesters"
            value={totalSemesters}
          />
        </div>

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
              placeholder="Search courses, codes or departments..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Semesters</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      Loading courses...
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center"
                    >
                      <BookOpen
                        size={38}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="font-semibold text-slate-700">
                        No courses found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Create a course to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <BookOpen size={18} />
                          </div>

                          <div>
                            <div className="font-semibold text-slate-900">
                              {course.name}
                            </div>

                            <div className="mt-1 text-xs font-bold text-blue-600">
                              {course.code}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="font-medium text-slate-800">
                          {course.department.name}
                        </div>

                        <div className="text-xs text-slate-500">
                          {course.department.code}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {course.durationYears} Years
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold">
                        {course._count.users}
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold">
                        {course._count.semesters}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            course.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {course.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEdit(course)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() =>
                              deleteCourse(course)
                            }
                            className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="border-b border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? "Edit Course" : "Create Course"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure the academic course details.
              </p>
            </div>

            <div className="space-y-4 p-6">

              <Field
                label="Course Name"
                value={form.name}
                onChange={(value) =>
                  setForm({
                    ...form,
                    name: value,
                  })
                }
                placeholder="Bachelor of Computer Applications"
              />

              <Field
                label="Course Code"
                value={form.code}
                onChange={(value) =>
                  setForm({
                    ...form,
                    code: value.toUpperCase(),
                  })
                }
                placeholder="BCA"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department
                </label>

                <select
                  value={form.departmentId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      departmentId: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Duration
                </label>

                <select
                  value={form.durationYears}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      durationYears: Number(
                        event.target.value
                      ),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                  <option value={4}>4 Years</option>
                  <option value={5}>5 Years</option>
                  <option value={6}>6 Years</option>
                </select>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      active: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                Active Course
              </label>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">

              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={saveCourse}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update Course"
                    : "Create Course"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
      />
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
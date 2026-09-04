"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  Mail,
  Building2,
  BookOpen,
  GraduationCap,
  Loader2,
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

type Student = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT";
  departmentId: string | null;
  courseId: string | null;
  semesterId: string | null;
  createdAt: string;
  department: Department | null;
  course: {
    id: string;
    name: string;
    code: string;
  } | null;
  semester: {
    id: string;
    name: string;
    number: number;
  } | null;
};

type FormData = {
  name: string;
  email: string;
  password: string;
  departmentId: string;
  courseId: string;
  semesterId: string;
};

const emptyForm: FormData = {
  name: "",
  email: "",
  password: "",
  departmentId: "",
  courseId: "",
  semesterId: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/students", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load students.");
      }

      setStudents(data.students || []);
      setDepartments(data.departments || []);
      setCourses(data.courses || []);
      setSemesters(data.semesters || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load students.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.name.toLowerCase().includes(value) ||
        student.email.toLowerCase().includes(value) ||
        student.department?.name.toLowerCase().includes(value) ||
        student.course?.name.toLowerCase().includes(value) ||
        student.course?.code.toLowerCase().includes(value)
      );
    });
  }, [students, search]);

  const availableCourses = useMemo(() => {
    if (!form.departmentId) {
      return courses;
    }

    return courses.filter(
      (course) => course.departmentId === form.departmentId,
    );
  }, [courses, form.departmentId]);

  const availableSemesters = useMemo(() => {
    if (!form.courseId) {
      return semesters;
    }

    return semesters.filter(
      (semester) => semester.courseId === form.courseId,
    );
  }, [semesters, form.courseId]);

  function openAddModal() {
    setEditingStudent(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);

    setForm({
      name: student.name,
      email: student.email,
      password: "",
      departmentId: student.departmentId || "",
      courseId: student.courseId || "",
      semesterId: student.semesterId || "",
    });

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingStudent(null);
    setForm(emptyForm);
    setError("");
  }

  function updateForm(
    field: keyof FormData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "departmentId"
        ? {
            courseId: "",
            semesterId: "",
          }
        : {}),
      ...(field === "courseId"
        ? {
            semesterId: "",
          }
        : {}),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.name.trim()) {
        throw new Error("Student name is required.");
      }

      if (!form.email.trim()) {
        throw new Error("Student email is required.");
      }

      if (!editingStudent && form.password.length < 6) {
        throw new Error(
          "Password must contain at least 6 characters.",
        );
      }

      const payload = {
        ...(editingStudent ? { id: editingStudent.id } : {}),
        name: form.name.trim(),
        email: form.email.trim(),
        ...(form.password
          ? { password: form.password }
          : {}),
        departmentId: form.departmentId || undefined,
        courseId: form.courseId || undefined,
        semesterId: form.semesterId || undefined,
      };

      const response = await fetch("/api/admin/students", {
        method: editingStudent ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save student.",
        );
      }

      setSuccess(
        editingStudent
          ? "Student updated successfully."
          : "Student created successfully.",
      );

      closeModal();
      await loadStudents();

      window.setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save student.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Delete ${student.name}?\n\nThis will permanently remove the student and their related academic records.`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/students?id=${encodeURIComponent(student.id)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete student.",
        );
      }

      setSuccess("Student deleted successfully.");
      await loadStudents();

      window.setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete student.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Students
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage student accounts, academic assignments, and enrollment details.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {error && !showModal && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Students
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {students.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Departments Used
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {new Set(
              students
                .map((student) => student.departmentId)
                .filter(Boolean),
            ).size}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Search Results
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {filteredStudents.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="relative max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, department or course..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <Loader2 size={20} className="animate-spin" />
                Loading students...
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={25} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                No students found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Add your first student or change the search criteria.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Student
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Department
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Course
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Semester
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {student.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {student.name}
                          </p>

                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <Mail size={12} />
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {student.department ? (
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {student.department.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {student.department.code}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {student.course ? (
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {student.course.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {student.course.code}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {student.semester ? (
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                          {student.semester.name}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(student)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit student"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteStudent(student)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Delete student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {editingStudent
                    ? "Edit Student"
                    : "Add Student"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingStudent
                    ? "Update the student's account and academic information."
                    : "Create a new student account."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Enter student's full name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm(
                        "email",
                        event.target.value,
                      )
                    }
                    placeholder="student@college.edu"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {editingStudent
                      ? "New Password (Optional)"
                      : "Password"}
                  </label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateForm(
                        "password",
                        event.target.value,
                      )
                    }
                    placeholder={
                      editingStudent
                        ? "Leave blank to keep current"
                        : "Minimum 6 characters"
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Building2 size={15} />
                    Department
                  </label>

                  <select
                    value={form.departmentId}
                    onChange={(event) =>
                      updateForm(
                        "departmentId",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select department
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name} (
                        {department.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <BookOpen size={15} />
                    Course
                  </label>

                  <select
                    value={form.courseId}
                    onChange={(event) =>
                      updateForm(
                        "courseId",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select course
                    </option>

                    {availableCourses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <GraduationCap size={15} />
                    Semester
                  </label>

                  <select
                    value={form.semesterId}
                    onChange={(event) =>
                      updateForm(
                        "semesterId",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select semester
                    </option>

                    {availableSemesters.map(
                      (semester) => (
                        <option
                          key={semester.id}
                          value={semester.id}
                        >
                          {semester.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingStudent
                      ? "Update Student"
                      : "Create Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
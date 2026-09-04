"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  GraduationCap,
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
  department: Department;
};

type Semester = {
  id: string;
  name: string;
  number: number;
  courseId: string;
  course: {
    id: string;
    name: string;
    code: string;
  };
};

type FacultyMember = {
  id: string;
  name: string;
  email: string;
};

type SubjectFaculty = {
  id: string;
  faculty: FacultyMember;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  credits: number;
  active: boolean;
  course: Course;
  semester: Semester;
  faculty: SubjectFaculty[];
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    credits: 3,
    courseId: "",
    semesterId: "",
    active: true,
  });

  async function loadData() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/subjects",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load subjects"
        );
      }

      setSubjects(data.subjects || []);
      setCourses(data.courses || []);
      setSemesters(data.semesters || []);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load subjects"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return subjects;
    }

    return subjects.filter((subject) => {
      return (
        subject.name.toLowerCase().includes(query) ||
        subject.code.toLowerCase().includes(query) ||
        subject.course.name
          .toLowerCase()
          .includes(query) ||
        subject.course.code
          .toLowerCase()
          .includes(query) ||
        subject.course.department.name
          .toLowerCase()
          .includes(query) ||
        subject.semester.name
          .toLowerCase()
          .includes(query)
      );
    });
  }, [subjects, search]);

  const availableSemesters = useMemo(() => {
    if (!form.courseId) {
      return [];
    }

    return semesters.filter(
      (semester) =>
        semester.courseId === form.courseId
    );
  }, [semesters, form.courseId]);

  function openCreate() {
    setEditing(null);

    const firstCourse = courses[0];

    const firstSemester = semesters.find(
      (semester) =>
        semester.courseId === firstCourse?.id
    );

    setForm({
      name: "",
      code: "",
      credits: 3,
      courseId: firstCourse?.id || "",
      semesterId: firstSemester?.id || "",
      active: true,
    });

    setShowModal(true);
  }

  function openEdit(subject: Subject) {
    setEditing(subject);

    setForm({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      courseId: subject.course.id,
      semesterId: subject.semester.id,
      active: subject.active,
    });

    setShowModal(true);
  }

  function changeCourse(courseId: string) {
    const firstSemester = semesters.find(
      (semester) =>
        semester.courseId === courseId
    );

    setForm({
      ...form,
      courseId,
      semesterId: firstSemester?.id || "",
    });
  }

  async function saveSubject() {
    if (!form.name.trim()) {
      alert("Subject name is required.");
      return;
    }

    if (!form.code.trim()) {
      alert("Subject code is required.");
      return;
    }

    if (!form.courseId) {
      alert("Please select a course.");
      return;
    }

    if (!form.semesterId) {
      alert("Please select a semester.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/subjects",
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
          data.error || "Failed to save subject"
        );
      }

      setShowModal(false);

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save subject"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubject(subject: Subject) {
    const confirmed = window.confirm(
      `Delete "${subject.name}" (${subject.code})?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/subjects?id=${subject.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete subject"
        );
      }

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete subject"
      );
    }
  }

  const totalCredits = subjects.reduce(
    (total, subject) =>
      total + subject.credits,
    0
  );

  const activeSubjects = subjects.filter(
    (subject) => subject.active
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Subjects
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage academic subjects across courses and semesters.
            </p>
          </div>

          <button
            onClick={openCreate}
            disabled={
              courses.length === 0 ||
              semesters.length === 0
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add Subject
          </button>

        </div>

        {/* STATS */}
        <div className="mb-7 grid gap-4 md:grid-cols-3">

          <Stat
            icon={<BookOpen size={20} />}
            label="Total Subjects"
            value={subjects.length}
          />

          <Stat
            icon={<GraduationCap size={20} />}
            label="Active Subjects"
            value={activeSubjects}
          />

          <Stat
            icon={<Layers3 size={20} />}
            label="Total Credits"
            value={totalCredits}
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
              placeholder="Search subjects, codes, courses or departments..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead className="border-b border-slate-100 bg-slate-50">

                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                  <th className="px-6 py-4">
                    Subject
                  </th>

                  <th className="px-6 py-4">
                    Course
                  </th>

                  <th className="px-6 py-4">
                    Department
                  </th>

                  <th className="px-6 py-4">
                    Semester
                  </th>

                  <th className="px-6 py-4">
                    Credits
                  </th>

                  <th className="px-6 py-4">
                    Faculty
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
                      colSpan={8}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      Loading subjects...
                    </td>
                  </tr>
                ) : filteredSubjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >

                      <BookOpen
                        size={40}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="font-semibold text-slate-700">
                        No subjects found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Create a course and semester first, then add subjects.
                      </p>

                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* SUBJECT */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <BookOpen size={18} />
                          </div>

                          <div>

                            <div className="font-semibold text-slate-900">
                              {subject.name}
                            </div>

                            <div className="mt-1 text-xs font-bold text-blue-600">
                              {subject.code}
                            </div>

                          </div>

                        </div>

                      </td>

                      {/* COURSE */}
                      <td className="px-6 py-5">

                        <div className="font-semibold text-slate-800">
                          {subject.course.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {subject.course.code}
                        </div>

                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-6 py-5">

                        <div className="font-medium text-slate-800">
                          {subject.course.department.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {subject.course.department.code}
                        </div>

                      </td>

                      {/* SEMESTER */}
                      <td className="px-6 py-5">

                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                          {subject.semester.name}
                        </span>

                      </td>

                      {/* CREDITS */}
                      <td className="px-6 py-5">

                        <span className="font-semibold text-slate-800">
                          {subject.credits}
                        </span>

                      </td>

                      {/* FACULTY */}
                      <td className="px-6 py-5">

                        {subject.faculty.length > 0 ? (
                          <div>
                            <div className="font-medium text-slate-800">
                              {subject.faculty[0].faculty.name}
                            </div>

                            {subject.faculty.length > 1 && (
                              <div className="mt-1 text-xs text-slate-500">
                                +{subject.faculty.length - 1} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Not assigned
                          </span>
                        )}

                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            subject.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {subject.active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEdit(subject)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() =>
                              deleteSubject(subject)
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

            {/* MODAL HEADER */}
            <div className="border-b border-slate-100 p-6">

              <h2 className="text-lg font-bold text-slate-900">
                {editing
                  ? "Edit Subject"
                  : "Create Subject"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure the academic subject details.
              </p>

            </div>

            {/* FORM */}
            <div className="space-y-5 p-6">

              {/* COURSE */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Course
                </label>

                <select
                  value={form.courseId}
                  onChange={(event) =>
                    changeCourse(
                      event.target.value
                    )
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

              {/* SEMESTER */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Semester
                </label>

                <select
                  value={form.semesterId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      semesterId:
                        event.target.value,
                    })
                  }
                  disabled={
                    availableSemesters.length === 0
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                >

                  <option value="">
                    Select Semester
                  </option>

                  {availableSemesters.map(
                    (semester) => (
                      <option
                        key={semester.id}
                        value={semester.id}
                      >
                        {semester.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* NAME */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject Name
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Data Structures"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* CODE */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject Code
                </label>

                <input
                  value={form.code}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      code: event.target.value.toUpperCase(),
                    })
                  }
                  placeholder="CS301"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* CREDITS */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Credits
                </label>

                <select
                  value={form.credits}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      credits: Number(
                        event.target.value
                      ),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  {[1, 2, 3, 4, 5, 6, 7, 8].map(
                    (credit) => (
                      <option
                        key={credit}
                        value={credit}
                      >
                        {credit} Credit
                        {credit !== 1 ? "s" : ""}
                      </option>
                    )
                  )}

                </select>

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

                Active Subject

              </label>

            </div>

            {/* FOOTER */}
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
                onClick={saveSubject}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update Subject"
                    : "Create Subject"}
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
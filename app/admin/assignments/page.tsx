"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Plus,
  Search,
  Trash2,
  Users,
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

type Faculty = {
  id: string;
  name: string;
  email: string;
  departmentId?: string | null;
};

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;

  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  facultyId: string | null;

  assignedDate: string;
  dueDate: string;

  totalMarks: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  attachmentUrl: string | null;
  active: boolean;

  department: Department | null;
  course: Course | null;
  semester: Semester | null;
  subject: Subject | null;
  faculty: Faculty | null;
};

type FormState = {
  title: string;
  description: string;
  instructions: string;

  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  facultyId: string;

  assignedDate: string;
  dueDate: string;

  totalMarks: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "DRAFT" | "PUBLISHED" | "CLOSED";

  attachmentUrl: string;
  active: boolean;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  instructions: "",

  departmentId: "",
  courseId: "",
  semesterId: "",
  subjectId: "",
  facultyId: "",

  assignedDate: "",
  dueDate: "",

  totalMarks: "10",
  priority: "MEDIUM",
  status: "PUBLISHED",

  attachmentUrl: "",
  active: true,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}

function getDueState(
  assignment: Assignment
) {
  if (!assignment.active) {
    return "Inactive";
  }

  if (assignment.status === "DRAFT") {
    return "Draft";
  }

  if (assignment.status === "CLOSED") {
    return "Closed";
  }

  if (
    new Date(assignment.dueDate) <
    new Date()
  ) {
    return "Overdue";
  }

  return "Published";
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [semesters, setSemesters] =
    useState<Semester[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [faculty, setFaculty] =
    useState<Faculty[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState("");

  const [
    courseFilter,
    setCourseFilter,
  ] = useState("");

  const [
    semesterFilter,
    setSemesterFilter,
  ] = useState("");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [form, setForm] =
    useState<FormState>(
      emptyForm
    );

  async function loadData() {
    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/admin/assignments",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load assignments."
        );
      }

      setAssignments(
        data.assignments || []
      );

      setDepartments(
        data.departments || []
      );

      setCourses(
        data.courses || []
      );

      setSemesters(
        data.semesters || []
      );

      setSubjects(
        data.subjects || []
      );

      setFaculty(
        data.faculty || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const formCourses =
    useMemo(
      () =>
        courses.filter(
          (course) =>
            !form.departmentId ||
            course.departmentId ===
              form.departmentId
        ),
      [
        courses,
        form.departmentId,
      ]
    );

  const formSemesters =
    useMemo(
      () =>
        semesters.filter(
          (semester) =>
            !form.courseId ||
            semester.courseId ===
              form.courseId
        ),
      [
        semesters,
        form.courseId,
      ]
    );

  const formSubjects =
    useMemo(
      () =>
        subjects.filter(
          (subject) =>
            (!form.courseId ||
              subject.courseId ===
                form.courseId) &&
            (!form.semesterId ||
              subject.semesterId ===
                form.semesterId)
        ),
      [
        subjects,
        form.courseId,
        form.semesterId,
      ]
    );

  const formFaculty =
    useMemo(
      () =>
        faculty.filter(
          (person) =>
            !form.departmentId ||
            !person.departmentId ||
            person.departmentId ===
              form.departmentId
        ),
      [
        faculty,
        form.departmentId,
      ]
    );

  const filterCourses =
    useMemo(
      () =>
        courses.filter(
          (course) =>
            !departmentFilter ||
            course.departmentId ===
              departmentFilter
        ),
      [
        courses,
        departmentFilter,
      ]
    );

  const filterSemesters =
    useMemo(
      () =>
        semesters.filter(
          (semester) =>
            !courseFilter ||
            semester.courseId ===
              courseFilter
        ),
      [
        semesters,
        courseFilter,
      ]
    );

  const filteredAssignments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return assignments.filter(
        (assignment) => {
          const matchesSearch =
            !query ||
            assignment.title
              .toLowerCase()
              .includes(query) ||
            assignment.subject?.name
              .toLowerCase()
              .includes(query) ||
            assignment.subject?.code
              .toLowerCase()
              .includes(query) ||
            assignment.course?.name
              .toLowerCase()
              .includes(query) ||
            assignment.faculty?.name
              .toLowerCase()
              .includes(query);

          const matchesDepartment =
            !departmentFilter ||
            assignment.departmentId ===
              departmentFilter;

          const matchesCourse =
            !courseFilter ||
            assignment.courseId ===
              courseFilter;

          const matchesSemester =
            !semesterFilter ||
            assignment.semesterId ===
              semesterFilter;

          const matchesPriority =
            !priorityFilter ||
            assignment.priority ===
              priorityFilter;

          const matchesStatus =
            !statusFilter ||
            getDueState(
              assignment
            ) === statusFilter;

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesCourse &&
            matchesSemester &&
            matchesPriority &&
            matchesStatus
          );
        }
      );
    }, [
      assignments,
      search,
      departmentFilter,
      courseFilter,
      semesterFilter,
      priorityFilter,
      statusFilter,
    ]);

  const stats =
    useMemo(() => {
      const active =
        assignments.filter(
          (item) => item.active
        ).length;

      const published =
        assignments.filter(
          (item) =>
            item.status ===
            "PUBLISHED"
        ).length;

      const overdue =
        assignments.filter(
          (item) =>
            getDueState(item) ===
            "Overdue"
        ).length;

      const highPriority =
        assignments.filter(
          (item) =>
            item.priority ===
              "HIGH" &&
            item.active
        ).length;

      return {
        total:
          assignments.length,
        active,
        published,
        overdue,
        highPriority,
      };
    }, [assignments]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function openCreate() {
    resetForm();

    const now =
      new Date();

    const due =
      new Date(
        now.getTime() +
          7 *
            24 *
            60 *
            60 *
            1000
      );

    const toLocalInput =
      (date: Date) => {
        const offset =
          date.getTimezoneOffset() *
          60000;

        return new Date(
          date.getTime() -
            offset
        )
          .toISOString()
          .slice(0, 16);
      };

    setForm({
      ...emptyForm,
      assignedDate:
        toLocalInput(now),
      dueDate:
        toLocalInput(due),
    });

    setModalOpen(true);
  }

  function openEdit(
    assignment: Assignment
  ) {
    setEditingId(
      assignment.id
    );

    const toLocalInput =
      (value: string) => {
        const date =
          new Date(value);

        const offset =
          date.getTimezoneOffset() *
          60000;

        return new Date(
          date.getTime() -
            offset
        )
          .toISOString()
          .slice(0, 16);
      };

    setForm({
      title:
        assignment.title,

      description:
        assignment.description ||
        "",

      instructions:
        assignment.instructions ||
        "",

      departmentId:
        assignment.departmentId,

      courseId:
        assignment.courseId,

      semesterId:
        assignment.semesterId,

      subjectId:
        assignment.subjectId,

      facultyId:
        assignment.facultyId ||
        "",

      assignedDate:
        toLocalInput(
          assignment.assignedDate
        ),

      dueDate:
        toLocalInput(
          assignment.dueDate
        ),

      totalMarks:
        String(
          assignment.totalMarks
        ),

      priority:
        assignment.priority,

      status:
        assignment.status,

      attachmentUrl:
        assignment.attachmentUrl ||
        "",

      active:
        assignment.active,
    });

    setError("");
    setModalOpen(true);
  }

  function updateForm(
    key: keyof FormState,
    value: string | boolean
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  }

  async function saveAssignment() {
    try {
      setSaving(true);
      setError("");

      const payload = {
        title:
          form.title.trim(),

        description:
          form.description.trim() ||
          null,

        instructions:
          form.instructions.trim() ||
          null,

        departmentId:
          form.departmentId,

        courseId:
          form.courseId,

        semesterId:
          form.semesterId,

        subjectId:
          form.subjectId,

        facultyId:
          form.facultyId ||
          null,

        assignedDate:
          form.assignedDate,

        dueDate:
          form.dueDate,

        totalMarks:
          Number(
            form.totalMarks
          ),

        priority:
          form.priority,

        status:
          form.status,

        attachmentUrl:
          form.attachmentUrl.trim() ||
          null,

        active:
          form.active,
      };

      const response =
        await fetch(
          "/api/admin/assignments",
          {
            method:
              editingId
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                ...payload,
                ...(editingId
                  ? {
                      id: editingId,
                    }
                  : {}),
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save assignment."
        );
      }

      setModalOpen(false);
      resetForm();

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save assignment."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAssignment(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this official assignment?"
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/admin/assignments?id=${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete assignment."
        );
      }

      await loadData();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete assignment."
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
              <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
                <FileText size={24} />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Assignments
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage official academic assignments across all departments.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={
              openCreate
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
          >
            <Plus size={18} />
            Create Assignment
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            icon={
              <FileText
                size={20}
              />
            }
            label="Total"
            value={
              stats.total
            }
          />

          <StatCard
            icon={
              <CheckCircle2
                size={20}
              />
            }
            label="Active"
            value={
              stats.active
            }
          />

          <StatCard
            icon={
              <BookOpen
                size={20}
              />
            }
            label="Published"
            value={
              stats.published
            }
          />

          <StatCard
            icon={
              <Clock3
                size={20}
              />
            }
            label="Overdue"
            value={
              stats.overdue
            }
          />

          <StatCard
            icon={
              <Users
                size={20}
              />
            }
            label="High Priority"
            value={
              stats.highPriority
            }
          />

        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(5,1fr)]">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={
                  search
                }
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search assignments, subjects or faculty..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={
                departmentFilter
              }
              onChange={(e) => {
                setDepartmentFilter(
                  e.target.value
                );

                setCourseFilter(
                  ""
                );

                setSemesterFilter(
                  ""
                );
              }}
              className={selectClass}
            >
              <option value="">
                All Departments
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={
                      department.id
                    }
                    value={
                      department.id
                    }
                  >
                    {department.name}
                  </option>
                )
              )}
            </select>

            <select
              value={
                courseFilter
              }
              onChange={(e) => {
                setCourseFilter(
                  e.target.value
                );

                setSemesterFilter(
                  ""
                );
              }}
              className={selectClass}
            >
              <option value="">
                All Courses
              </option>

              {filterCourses.map(
                (course) => (
                  <option
                    key={
                      course.id
                    }
                    value={
                      course.id
                    }
                  >
                    {course.name}
                  </option>
                )
              )}
            </select>

            <select
              value={
                semesterFilter
              }
              onChange={(e) =>
                setSemesterFilter(
                  e.target.value
                )
              }
              className={selectClass}
            >
              <option value="">
                All Semesters
              </option>

              {filterSemesters.map(
                (semester) => (
                  <option
                    key={
                      semester.id
                    }
                    value={
                      semester.id
                    }
                  >
                    {semester.name}
                  </option>
                )
              )}
            </select>

            <select
              value={
                priorityFilter
              }
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value
                )
              }
              className={selectClass}
            >
              <option value="">
                All Priority
              </option>
              <option value="HIGH">
                High
              </option>
              <option value="MEDIUM">
                Medium
              </option>
              <option value="LOW">
                Low
              </option>
            </select>

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className={selectClass}
            >
              <option value="">
                All Status
              </option>
              <option value="Published">
                Published
              </option>
              <option value="Draft">
                Draft
              </option>
              <option value="Closed">
                Closed
              </option>
              <option value="Overdue">
                Overdue
              </option>
              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>
        </div>

        {error &&
          !modalOpen && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1300px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">

                  <th className={thClass}>
                    Assignment
                  </th>

                  <th className={thClass}>
                    Academic
                  </th>

                  <th className={thClass}>
                    Faculty
                  </th>

                  <th className={thClass}>
                    Assigned
                  </th>

                  <th className={thClass}>
                    Due Date
                  </th>

                  <th className={thClass}>
                    Marks
                  </th>

                  <th className={thClass}>
                    Priority
                  </th>

                  <th className={thClass}>
                    Status
                  </th>

                  <th className={thClass}>
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      Loading assignments...
                    </td>
                  </tr>
                ) : filteredAssignments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <FileText
                          size={26}
                        />
                      </div>

                      <p className="font-semibold text-slate-900">
                        No assignments found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Create an assignment to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map(
                    (assignment) => {
                      const status =
                        getDueState(
                          assignment
                        );

                      return (
                        <tr
                          key={
                            assignment.id
                          }
                          className="transition hover:bg-slate-50/80"
                        >

                          <td className="px-5 py-4">
                            <div className="max-w-[280px]">
                              <div className="font-semibold text-slate-900">
                                {
                                  assignment.title
                                }
                              </div>

                              {assignment.description && (
                                <div className="mt-1 truncate text-xs text-slate-500">
                                  {
                                    assignment.description
                                  }
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold text-slate-800">
                              {
                                assignment.subject?.name ||
                                "-"
                              }
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {
                                assignment.course?.name ||
                                "-"
                              }
                            </div>

                            <div className="mt-1 text-xs font-medium text-emerald-600">
                              {
                                assignment.department?.code ||
                                "-"
                              }{" "}
                              •{" "}
                              {
                                assignment.semester?.name ||
                                "-"
                              }
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {assignment.faculty ? (
                              <>
                                <div className="text-sm font-medium text-slate-800">
                                  {
                                    assignment.faculty.name
                                  }
                                </div>

                                <div className="mt-1 text-xs text-slate-500">
                                  {
                                    assignment.faculty.email
                                  }
                                </div>
                              </>
                            ) : (
                              <span className="text-sm text-slate-400">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {formatDate(
                              assignment.assignedDate
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {formatDate(
                                assignment.dueDate
                              )}
                            </div>

                            {new Date(
                              assignment.dueDate
                            ) <
                              new Date() &&
                              assignment.active && (
                                <div className="mt-1 text-xs font-semibold text-red-600">
                                  Overdue
                                </div>
                              )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                              {
                                assignment.totalMarks
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                assignment.priority ===
                                "HIGH"
                                  ? "bg-red-50 text-red-700"
                                  : assignment.priority ===
                                    "MEDIUM"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {
                                assignment.priority
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                status ===
                                "Published"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : status ===
                                    "Overdue"
                                  ? "bg-red-50 text-red-700"
                                  : status ===
                                    "Draft"
                                  ? "bg-amber-50 text-amber-700"
                                  : status ===
                                    "Closed"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">

                              <button
                                onClick={() =>
                                  openEdit(
                                    assignment
                                  )
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                title="Edit"
                              >
                                <Edit3
                                  size={16}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  deleteAssignment(
                                    assignment.id
                                  )
                                }
                                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Assignment"
                    : "Create Assignment"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Publish official academic work for students.
                </p>
              </div>

              <button
                onClick={() => {
                  setModalOpen(
                    false
                  );
                  resetForm();
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
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
                label="Assignment Title"
                className="md:col-span-2"
              >
                <input
                  value={
                    form.title
                  }
                  onChange={(e) =>
                    updateForm(
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Database Normalization Report"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Description"
                className="md:col-span-2"
              >
                <textarea
                  rows={3}
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    updateForm(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Short assignment description..."
                  className={inputClass}
                />
              </Field>

              <Field
                label="Department"
              >
                <select
                  value={
                    form.departmentId
                  }
                  onChange={(e) => {
                    updateForm(
                      "departmentId",
                      e.target.value
                    );

                    updateForm(
                      "courseId",
                      ""
                    );

                    updateForm(
                      "semesterId",
                      ""
                    );

                    updateForm(
                      "subjectId",
                      ""
                    );

                    updateForm(
                      "facultyId",
                      ""
                    );
                  }}
                  className={inputClass}
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (
                      department
                    ) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.id
                        }
                      >
                        {
                          department.name
                        }{" "}
                        (
                        {
                          department.code
                        }
                        )
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Course">
                <select
                  value={
                    form.courseId
                  }
                  onChange={(e) => {
                    updateForm(
                      "courseId",
                      e.target.value
                    );

                    updateForm(
                      "semesterId",
                      ""
                    );

                    updateForm(
                      "subjectId",
                      ""
                    );
                  }}
                  className={inputClass}
                >
                  <option value="">
                    Select Course
                  </option>

                  {formCourses.map(
                    (course) => (
                      <option
                        key={
                          course.id
                        }
                        value={
                          course.id
                        }
                      >
                        {
                          course.name
                        }{" "}
                        (
                        {
                          course.code
                        }
                        )
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Semester">
                <select
                  value={
                    form.semesterId
                  }
                  onChange={(e) => {
                    updateForm(
                      "semesterId",
                      e.target.value
                    );

                    updateForm(
                      "subjectId",
                      ""
                    );
                  }}
                  className={inputClass}
                >
                  <option value="">
                    Select Semester
                  </option>

                  {formSemesters.map(
                    (
                      semester
                    ) => (
                      <option
                        key={
                          semester.id
                        }
                        value={
                          semester.id
                        }
                      >
                        {
                          semester.name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Subject">
                <select
                  value={
                    form.subjectId
                  }
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

                  {formSubjects.map(
                    (subject) => (
                      <option
                        key={
                          subject.id
                        }
                        value={
                          subject.id
                        }
                      >
                        {
                          subject.name
                        }{" "}
                        (
                        {
                          subject.code
                        }
                        )
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Faculty">
                <select
                  value={
                    form.facultyId
                  }
                  onChange={(e) =>
                    updateForm(
                      "facultyId",
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Unassigned
                  </option>

                  {formFaculty.map(
                    (person) => (
                      <option
                        key={
                          person.id
                        }
                        value={
                          person.id
                        }
                      >
                        {
                          person.name
                        }{" "}
                        —{" "}
                        {
                          person.email
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Assigned Date">
                <input
                  type="datetime-local"
                  value={
                    form.assignedDate
                  }
                  onChange={(e) =>
                    updateForm(
                      "assignedDate",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Due Date">
                <input
                  type="datetime-local"
                  value={
                    form.dueDate
                  }
                  onChange={(e) =>
                    updateForm(
                      "dueDate",
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
                  max="1000"
                  value={
                    form.totalMarks
                  }
                  onChange={(e) =>
                    updateForm(
                      "totalMarks",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Priority">
                <select
                  value={
                    form.priority
                  }
                  onChange={(e) =>
                    updateForm(
                      "priority",
                      e.target.value as
                        | "LOW"
                        | "MEDIUM"
                        | "HIGH"
                    )
                  }
                  className={inputClass}
                >
                  <option value="LOW">
                    Low
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HIGH">
                    High
                  </option>
                </select>
              </Field>

              <Field label="Status">
                <select
                  value={
                    form.status
                  }
                  onChange={(e) =>
                    updateForm(
                      "status",
                      e.target.value as
                        | "DRAFT"
                        | "PUBLISHED"
                        | "CLOSED"
                    )
                  }
                  className={inputClass}
                >
                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="PUBLISHED">
                    Published
                  </option>

                  <option value="CLOSED">
                    Closed
                  </option>
                </select>
              </Field>

              <Field
                label="Attachment URL"
                className="md:col-span-2"
              >
                <input
                  value={
                    form.attachmentUrl
                  }
                  onChange={(e) =>
                    updateForm(
                      "attachmentUrl",
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                  className={inputClass}
                />
              </Field>

              <Field
                label="Instructions"
                className="md:col-span-2"
              >
                <textarea
                  rows={5}
                  value={
                    form.instructions
                  }
                  onChange={(e) =>
                    updateForm(
                      "instructions",
                      e.target.value
                    )
                  }
                  placeholder="Submission instructions, formatting rules, requirements..."
                  className={inputClass}
                />
              </Field>

              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      form.active
                    }
                    onChange={(e) =>
                      updateForm(
                        "active",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />

                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      Active Assignment
                    </div>

                    <div className="text-xs text-slate-500">
                      Active assignments can be displayed in the student portal.
                    </div>
                  </div>
                </label>

              </div>

            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">

              <button
                onClick={() => {
                  setModalOpen(
                    false
                  );
                  resetForm();
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  saveAssignment
                }
                disabled={
                  saving
                }
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Assignment"
                  : "Create Assignment"}
              </button>

            </div>

          </div>
        </div>
      )}
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500";

const thClass =
  "px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500";

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
    <label
      className={`block ${className}`}
    >
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
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
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
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
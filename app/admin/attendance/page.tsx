"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
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

type Student = {
  id: string;
  name: string;
  email: string;
  departmentId?: string | null;
  courseId?: string | null;
  semesterId?: string | null;
};

type Attendance = {
  id: string;
  attendanceDate: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string | null;
  studentId: string;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  student?: Student | null;
  subject?: Subject | null;
  course?: Course | null;
  department?: Department | null;
  semester?: Semester | null;
};

type Stats = {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
};

const emptyForm: {
  studentId: string;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  attendanceDate: string;
  status: Attendance["status"];
  remarks: string;
} = {
  studentId: "",
  departmentId: "",
  courseId: "",
  semesterId: "",
  subjectId: "",
  attendanceDate: new Date()
    .toISOString()
    .slice(0, 10),
  status: "PRESENT",
  remarks: "",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: Attendance["status"]) {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ABSENT":
      return "bg-red-50 text-red-700 border-red-200";
    case "LATE":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function statusLabel(status: Attendance["status"]) {
  if (status === "PRESENT") return "Present";
  if (status === "ABSENT") return "Absent";
  if (status === "LATE") return "Late";
  return "Excused";
}

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<Attendance | null>(null);

  const [form, setForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (departmentFilter)
        params.set("departmentId", departmentFilter);
      if (courseFilter)
        params.set("courseId", courseFilter);
      if (semesterFilter)
        params.set("semesterId", semesterFilter);
      if (subjectFilter)
        params.set("subjectId", subjectFilter);
      if (statusFilter)
        params.set("status", statusFilter);
      if (dateFilter)
        params.set("date", dateFilter);
      if (search.trim())
        params.set("search", search.trim());

      const response = await fetch(
        `/api/admin/attendance?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load attendance."
        );
      }

      setAttendance(data.attendance ?? []);
      setDepartments(data.departments ?? []);
      setCourses(data.courses ?? []);
      setSemesters(data.semesters ?? []);
      setSubjects(data.subjects ?? []);
      setStudents(data.students ?? []);
      setStats(
        data.stats ?? {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          percentage: 0,
        }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }, [
    departmentFilter,
    courseFilter,
    semesterFilter,
    subjectFilter,
    statusFilter,
    dateFilter,
    search,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadData]);

  const modalCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          !form.departmentId ||
          course.departmentId === form.departmentId
      ),
    [courses, form.departmentId]
  );

  const modalSemesters = useMemo(
    () =>
      semesters.filter(
        (semester) =>
          !form.courseId ||
          semester.courseId === form.courseId
      ),
    [semesters, form.courseId]
  );

  const modalSubjects = useMemo(
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

  const modalStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          (!form.departmentId ||
            student.departmentId === form.departmentId) &&
          (!form.courseId ||
            student.courseId === form.courseId) &&
          (!form.semesterId ||
            student.semesterId === form.semesterId)
      ),
    [
      students,
      form.departmentId,
      form.courseId,
      form.semesterId,
    ]
  );

  const filterCourses = courses.filter(
    (course) =>
      !departmentFilter ||
      course.departmentId === departmentFilter
  );

  const filterSemesters = semesters.filter(
    (semester) =>
      !courseFilter ||
      semester.courseId === courseFilter
  );

  const filterSubjects = subjects.filter(
    (subject) =>
      (!courseFilter ||
        subject.courseId === courseFilter) &&
      (!semesterFilter ||
        subject.semesterId === semesterFilter)
  );

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      attendanceDate:
        dateFilter ||
        new Date().toISOString().slice(0, 10),
      departmentId: departmentFilter,
      courseId: courseFilter,
      semesterId: semesterFilter,
      subjectId: subjectFilter,
    });
    setModalOpen(true);
  }

  function openEdit(item: Attendance) {
    setEditing(item);

    setForm({
      studentId: item.studentId,
      departmentId: item.departmentId,
      courseId: item.courseId,
      semesterId: item.semesterId,
      subjectId: item.subjectId,
      attendanceDate:
        item.attendanceDate.slice(0, 10),
      status: item.status,
      remarks: item.remarks ?? "",
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function changeDepartment(value: string) {
    setForm((current) => ({
      ...current,
      departmentId: value,
      courseId: "",
      semesterId: "",
      subjectId: "",
      studentId: "",
    }));
  }

  function changeCourse(value: string) {
    setForm((current) => ({
      ...current,
      courseId: value,
      semesterId: "",
      subjectId: "",
      studentId: "",
    }));
  }

  function changeSemester(value: string) {
    setForm((current) => ({
      ...current,
      semesterId: value,
      subjectId: "",
      studentId: "",
    }));
  }

  async function saveAttendance(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        remarks: form.remarks || null,
      };

      const response = await fetch(
        "/api/admin/attendance",
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            editing
              ? {
                  id: editing.id,
                  status: form.status,
                  remarks: form.remarks || null,
                }
              : payload
          ),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to save attendance."
        );
      }

      closeModal();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAttendance(id: string) {
    const confirmed = window.confirm(
      "Delete this attendance record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/admin/attendance?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete attendance."
        );
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete attendance."
      );
    }
  }

  const lowAttendance =
    stats.total > 0 && stats.percentage < 75;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <UserCheck className="h-4 w-4" />
              Academic Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Attendance Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor and manage student attendance across all departments.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Record Attendance
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">{error}</div>

            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Records
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Present
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {stats.present}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Absent
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {stats.absent}
                </p>
              </div>
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <X className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Late
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {stats.late}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Attendance Rate
                </p>
                <p
                  className={`mt-2 text-3xl font-bold ${
                    lowAttendance
                      ? "text-red-600"
                      : "text-indigo-600"
                  }`}
                >
                  {stats.percentage}%
                </p>
              </div>

              <div
                className={`rounded-xl p-3 ${
                  lowAttendance
                    ? "bg-red-50 text-red-600"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                {lowAttendance ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <UserCheck className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">
              Attendance Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">

            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search students..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCourseFilter("");
                setSemesterFilter("");
                setSubjectFilter("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â {item.name}
                </option>
              ))}
            </select>

            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setSemesterFilter("");
                setSubjectFilter("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Courses</option>
              {filterCourses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â {item.name}
                </option>
              ))}
            </select>

            <select
              value={semesterFilter}
              onChange={(e) => {
                setSemesterFilter(e.target.value);
                setSubjectFilter("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Semesters</option>
              {filterSemesters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={subjectFilter}
              onChange={(e) =>
                setSubjectFilter(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Subjects</option>
              {filterSubjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â {item.name}
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
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="EXCUSED">Excused</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Attendance Records
              </h2>
              <p className="text-xs text-slate-500">
                {attendance.length} records displayed
              </p>
            </div>

            {lowAttendance && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Attendance below 75%
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading attendance...
              </div>
            </div>
          ) : attendance.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4">
                <CalendarDays className="h-7 w-7 text-slate-500" />
              </div>

              <h3 className="font-semibold text-slate-900">
                No attendance records found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Adjust your filters or record the first attendance entry.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Record Attendance
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Academic
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Subject
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Remarks
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {attendance.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                            {(item.student?.name || "S")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.student?.name ||
                                "Unknown Student"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {item.student?.email || "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {item.course?.code || "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.semester?.name || "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {item.department?.code || "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.subject?.name || "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.subject?.code || "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(item.attendanceDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                            item.status
                          )}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </td>

                      <td className="max-w-[220px] px-5 py-4 text-sm text-slate-500">
                        <span className="line-clamp-2">
                          {item.remarks || "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEdit(item)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit attendance"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              deleteAttendance(item.id)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete attendance"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editing
                    ? "Update Attendance"
                    : "Record Attendance"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editing
                    ? "Update attendance status or remarks."
                    : "Record official student attendance."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveAttendance}
              className="space-y-5 p-6"
            >

              {!editing && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Department
                      </span>

                      <div className="relative">
                        <select
                          required
                          value={form.departmentId}
                          onChange={(e) =>
                            changeDepartment(
                              e.target.value
                            )
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">
                            Select department
                          </option>

                          {departments.map(
                            (item) => (
                              <option
                                key={item.id}
                                value={item.id}
                              >
                                {item.code} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â {item.name}
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Course
                      </span>

                      <select
                        required
                        value={form.courseId}
                        onChange={(e) =>
                          changeCourse(
                            e.target.value
                          )
                        }
                        disabled={!form.departmentId}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none disabled:bg-slate-50 focus:border-indigo-500"
                      >
                        <option value="">
                          Select course
                        </option>

                        {modalCourses.map(
                          (item) => (
                            <option
                              key={item.id}
                              value={item.id}
                            >
                              {item.code} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â {item.name}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Semester
                      </span>

                      <select
                        required
                        value={form.semesterId}
                        onChange={(e) =>
                          changeSemester(
                            e.target.value
                          )
                        }
                        disabled={!form.courseId}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none disabled:bg-slate-50 focus:border-indigo-500"
                      >
                        <option value="">
                          Select semester
                        </option>

                        {modalSemesters.map(
                          (item) => (
                            <option
                              key={item.id}
                              value={item.id}
                            >
                              {item.name}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Subject
                      </span>

                      <select
                        required
                        value={form.subjectId}
                        onChange={(e) =>
                          setForm(
                            (current) => ({
                              ...current,
                              subjectId:
                                e.target.value,
                            })
                          )
                        }
                        disabled={!form.semesterId}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none disabled:bg-slate-50 focus:border-indigo-500"
                      >
                        <option value="">
                          Select subject
                        </option>

                        {modalSubjects.map(
                          (item) => (
                            <option
                              key={item.id}
                              value={item.id}
                            >
                              {item.code} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â {item.name}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Student
                    </span>

                    <select
                      required
                      value={form.studentId}
                      onChange={(e) =>
                        setForm(
                          (current) => ({
                            ...current,
                            studentId:
                              e.target.value,
                          })
                        )
                      }
                      disabled={!form.semesterId}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none disabled:bg-slate-50 focus:border-indigo-500"
                    >
                      <option value="">
                        Select student
                      </option>

                      {modalStudents.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â {item.email}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Attendance Date
                    </span>

                    <input
                      required
                      type="date"
                      value={form.attendanceDate}
                      onChange={(e) =>
                        setForm(
                          (current) => ({
                            ...current,
                            attendanceDate:
                              e.target.value,
                          })
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
                    />
                  </label>
                </>
              )}

              {editing && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Attendance Record
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {editing.student?.name ||
                      "Unknown Student"}
                  </p>

                  <p className="text-sm text-slate-500">
                    {editing.subject?.name ||
                      "Unknown Subject"}{" "}
                    ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â·{" "}
                    {formatDate(
                      editing.attendanceDate
                    )}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Attendance Status
                  </span>

                  <select
                    required
                    value={form.status}
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          status:
                            e.target.value as Attendance["status"],
                        })
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="PRESENT">
                      Present
                    </option>
                    <option value="ABSENT">
                      Absent
                    </option>
                    <option value="LATE">
                      Late
                    </option>
                    <option value="EXCUSED">
                      Excused
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Remarks
                  </span>

                  <input
                    value={form.remarks}
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          remarks:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Optional remarks"
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editing
                    ? "Update Attendance"
                    : "Record Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
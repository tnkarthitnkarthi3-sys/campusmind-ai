"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  DoorOpen,
  Edit3,
  GraduationCap,
  Loader2,
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
  departmentId: string | null;
};

type Entry = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string | null;
  section: string | null;
  active: boolean;
  department: Department;
  course: {
    id: string;
    name: string;
    code: string;
  };
  semester: {
    id: string;
    name: string;
    number: number;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  faculty: {
    id: string;
    name: string;
    email: string;
  };
};

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const emptyForm = {
  day: "MONDAY",
  startTime: "09:00",
  endTime: "10:00",
  room: "",
  section: "",
  departmentId: "",
  courseId: "",
  semesterId: "",
  subjectId: "",
  facultyId: "",
  active: true,
};

export default function AdminTimetablePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/timetable", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load timetable");
      }

      setEntries(data.entries || []);
      setDepartments(data.departments || []);
      setCourses(data.courses || []);
      setSemesters(data.semesters || []);
      setSubjects(data.subjects || []);
      setFaculty(data.faculty || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load timetable"
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
        (course) =>
          !form.departmentId ||
          course.departmentId === form.departmentId
      ),
    [courses, form.departmentId]
  );

  const filteredSemesters = useMemo(
    () =>
      semesters.filter(
        (semester) =>
          !form.courseId ||
          semester.courseId === form.courseId
      ),
    [semesters, form.courseId]
  );

  const filteredSubjects = useMemo(
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

  const filteredFaculty = useMemo(
    () =>
      faculty.filter(
        (person) =>
          !form.departmentId ||
          person.departmentId === form.departmentId
      ),
    [faculty, form.departmentId]
  );

  const visibleEntries = useMemo(() => {
    const q = search.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesDay =
        selectedDay === "ALL" || entry.day === selectedDay;

      const matchesSearch =
        !q ||
        entry.subject.name.toLowerCase().includes(q) ||
        entry.subject.code.toLowerCase().includes(q) ||
        entry.faculty.name.toLowerCase().includes(q) ||
        entry.course.name.toLowerCase().includes(q) ||
        entry.course.code.toLowerCase().includes(q) ||
        entry.department.name.toLowerCase().includes(q) ||
        (entry.room || "").toLowerCase().includes(q);

      return matchesDay && matchesSearch;
    });
  }, [entries, search, selectedDay]);

  const stats = useMemo(() => {
    return {
      total: entries.length,
      active: entries.filter((x) => x.active).length,
      faculty: new Set(entries.map((x) => x.faculty.id)).size,
      rooms: new Set(
        entries
          .map((x) => x.room)
          .filter(Boolean)
      ).size,
    };
  }, [entries]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(entry: Entry) {
    setEditingId(entry.id);
    setForm({
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room || "",
      section: entry.section || "",
      departmentId: entry.department.id,
      courseId: entry.course.id,
      semesterId: entry.semester.id,
      subjectId: entry.subject.id,
      facultyId: entry.faculty.id,
      active: entry.active,
    });
    setError("");
    setModalOpen(true);
  }

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      if (field === "departmentId") {
        next.courseId = "";
        next.semesterId = "";
        next.subjectId = "";
        next.facultyId = "";
      }

      if (field === "courseId") {
        next.semesterId = "";
        next.subjectId = "";
      }

      if (field === "semesterId") {
        next.subjectId = "";
      }

      return next;
    });
  }

  async function saveEntry(event: React.FormEvent) {
    event.preventDefault();

    if (!form.departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!form.courseId) {
      setError("Please select a course.");
      return;
    }

    if (!form.semesterId) {
      setError("Please select a semester.");
      return;
    }

    if (!form.subjectId) {
      setError("Please select a subject.");
      return;
    }

    if (!form.facultyId) {
      setError("Please select a faculty member.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/admin/timetable", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? { id: editingId, ...form }
            : form
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save timetable"
        );
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save timetable"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    const confirmed = window.confirm(
      "Delete this timetable entry?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/timetable?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete timetable"
        );
      }

      await loadData();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Unable to delete timetable"
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] p-6 lg:p-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Academic Management
              <span>/</span>
              Timetable
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Academic Timetable
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage department-wise class schedules, faculty assignments and rooms.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add Timetable
          </button>
        </div>

        {/* STATS */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Total Sessions"
            value={stats.total}
          />

          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Active Sessions"
            value={stats.active}
          />

          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Faculty Assigned"
            value={stats.faculty}
          />

          <StatCard
            icon={<DoorOpen className="h-5 w-5" />}
            label="Rooms Used"
            value={stats.rooms}
          />
        </div>

        {/* TOOLBAR */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject, faculty, course, department..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="ALL">All Days</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ERROR */}
        {error && !modalOpen && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1250px] w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {[
                    "Schedule",
                    "Department",
                    "Course",
                    "Semester",
                    "Subject",
                    "Faculty",
                    "Room",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <Loader2 className="mx-auto h-7 w-7 animate-spin text-slate-400" />
                      <p className="mt-3 text-sm text-slate-500">
                        Loading timetable...
                      </p>
                    </td>
                  </tr>
                ) : visibleEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
                      <h3 className="mt-4 text-base font-semibold text-slate-900">
                        No timetable entries found
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Create a timetable entry to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  visibleEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {entry.day.charAt(0) +
                            entry.day.slice(1).toLowerCase()}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {entry.startTime} - {entry.endTime}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {entry.department.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {entry.department.code}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {entry.course.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {entry.course.code}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {entry.semester.name}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {entry.subject.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {entry.subject.code}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {entry.faculty.name}
                        </div>

                        {entry.section && (
                          <div className="mt-1 text-xs text-slate-500">
                            Section {entry.section}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {entry.room ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            <DoorOpen className="h-3.5 w-3.5" />
                            {entry.room}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            entry.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {entry.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(entry)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              deleteEntry(entry.id)
                            }
                            className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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

        <div className="mt-4 text-xs text-slate-400">
          Showing {visibleEntries.length} of {entries.length} timetable entries
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Timetable"
                    : "Create Timetable"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure the academic class schedule.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveEntry}
              className="space-y-6 p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Day">
                  <select
                    value={form.day}
                    onChange={(e) =>
                      updateField("day", e.target.value)
                    }
                    className="input"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day.charAt(0) +
                          day.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Room">
                  <input
                    value={form.room}
                    onChange={(e) =>
                      updateField("room", e.target.value)
                    }
                    placeholder="e.g. Lab 204"
                    className="input"
                  />
                </Field>

                <Field label="Start Time">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      updateField(
                        "startTime",
                        e.target.value
                      )
                    }
                    className="input"
                  />
                </Field>

                <Field label="End Time">
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      updateField(
                        "endTime",
                        e.target.value
                      )
                    }
                    className="input"
                  />
                </Field>

                <Field label="Department">
                  <select
                    value={form.departmentId}
                    onChange={(e) =>
                      updateField(
                        "departmentId",
                        e.target.value
                      )
                    }
                    className="input"
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
                </Field>

                <Field label="Course">
                  <select
                    value={form.courseId}
                    onChange={(e) =>
                      updateField(
                        "courseId",
                        e.target.value
                      )
                    }
                    className="input"
                    disabled={!form.departmentId}
                  >
                    <option value="">
                      Select course
                    </option>

                    {filteredCourses.map((course) => (
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
                    onChange={(e) =>
                      updateField(
                        "semesterId",
                        e.target.value
                      )
                    }
                    className="input"
                    disabled={!form.courseId}
                  >
                    <option value="">
                      Select semester
                    </option>

                    {filteredSemesters.map((semester) => (
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
                      updateField(
                        "subjectId",
                        e.target.value
                      )
                    }
                    className="input"
                    disabled={!form.semesterId}
                  >
                    <option value="">
                      Select subject
                    </option>

                    {filteredSubjects.map((subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Faculty">
                  <select
                    value={form.facultyId}
                    onChange={(e) =>
                      updateField(
                        "facultyId",
                        e.target.value
                      )
                    }
                    className="input"
                    disabled={!form.departmentId}
                  >
                    <option value="">
                      Select faculty
                    </option>

                    {filteredFaculty.map((person) => (
                      <option
                        key={person.id}
                        value={person.id}
                      >
                        {person.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Section">
                  <input
                    value={form.section}
                    onChange={(e) =>
                      updateField(
                        "section",
                        e.target.value
                      )
                    }
                    placeholder="Optional e.g. A"
                    className="input"
                  />
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    updateField(
                      "active",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 rounded"
                />

                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Active timetable entry
                  </div>
                  <div className="text-xs text-slate-500">
                    Active entries are available to academic portals.
                  </div>
                </div>
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingId
                    ? "Save Changes"
                    : "Create Timetable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          height: 44px;
          width: 100%;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 0 12px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
        }

        .input:focus {
          border-color: #64748b;
          box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
        }

        .input:disabled {
          cursor: not-allowed;
          background: #f8fafc;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
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
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
          {icon}
        </div>
      </div>

      <div className="mt-5 text-2xl font-bold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-sm text-slate-500">
        {label}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  Users,
  X,
  AlertCircle,
} from "lucide-react";

type Subject = {
  id: string;
  name: string;
  code?: string | null;
};

type Student = {
  id: string;
  name: string;
  email?: string | null;
  rollNumber?: string | null;
};

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

type AttendanceRecord = {
  id: string;
  studentId: string;
  subjectId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  remarks?: string | null;
};

type AttendanceRow = Student & {
  status: AttendanceStatus;
  remarks: string;
};

const statusOptions: {
  value: AttendanceStatus;
  label: string;
}[] = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "EXCUSED", label: "Excused" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function FacultyAttendancePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(today());

  const [rows, setRows] = useState<AttendanceRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const [subjectsResponse, studentsResponse] = await Promise.all([
        fetch("/api/faculty/subjects", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/faculty/students", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const subjectsData = await subjectsResponse.json();
      const studentsData = await studentsResponse.json();

      if (!subjectsResponse.ok) {
        throw new Error(
          subjectsData?.error || "Unable to load faculty subjects."
        );
      }

      if (!studentsResponse.ok) {
        throw new Error(
          studentsData?.error || "Unable to load department students."
        );
      }

      const subjectList =
        subjectsData?.subjects ||
        subjectsData?.data ||
        (Array.isArray(subjectsData) ? subjectsData : []);

      const studentList =
        studentsData?.students ||
        studentsData?.data ||
        (Array.isArray(studentsData) ? studentsData : []);

      setSubjects(subjectList);
      setStudents(studentList);

      if (subjectList.length > 0) {
        setSubjectId(subjectList[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance data."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAttendance() {
    if (!subjectId || !date) return;

    try {
      setError("");
      setSuccess("");

      const params = new URLSearchParams({
        subjectId,
        date,
      });

      const response = await fetch(
        `/api/faculty/attendance?${params.toString()}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to load attendance records."
        );
      }

      const records: AttendanceRecord[] =
        data?.attendance ||
        data?.records ||
        data?.data ||
        [];

      const recordMap = new Map(
        records.map((record) => [record.studentId, record])
      );

      setRows(
        students.map((student) => {
          const record = recordMap.get(student.id);

          return {
            ...student,
            status: record?.status || "PRESENT",
            remarks: record?.remarks || "",
          };
        })
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance."
      );

      setRows(
        students.map((student) => ({
          ...student,
          status: "PRESENT",
          remarks: "",
        }))
      );
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (subjectId && date && students.length > 0) {
      loadAttendance();
    }
  }, [subjectId, date, students.length]);

  function updateStatus(
    studentId: string,
    status: AttendanceStatus
  ) {
    setRows((current) =>
      current.map((row) =>
        row.id === studentId
          ? { ...row, status }
          : row
      )
    );
  }

  function updateRemarks(
    studentId: string,
    remarks: string
  ) {
    setRows((current) =>
      current.map((row) =>
        row.id === studentId
          ? { ...row, remarks }
          : row
      )
    );
  }

  function markAll(status: AttendanceStatus) {
    setRows((current) =>
      current.map((row) => ({
        ...row,
        status,
      }))
    );
  }

  async function saveAttendance() {
    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    if (!date) {
      setError("Please select an attendance date.");
      return;
    }

    if (rows.length === 0) {
      setError("No students are available.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      for (const row of rows) {
        const response = await fetch("/api/faculty/attendance", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: row.id,
            subjectId,
            attendanceDate: date,
            status: row.status,
            remarks: row.remarks || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              `Unable to save attendance for ${row.name}.`
          );
        }
      }

      setSuccess(
        `Attendance saved successfully for ${rows.length} students.`
      );

      await loadAttendance();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredRows = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return rows;

    return rows.filter((student) =>
      [
        student.name,
        student.email,
        student.rollNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [rows, search]);

  const counts = useMemo(() => {
    return {
      total: rows.length,
      present: rows.filter((r) => r.status === "PRESENT").length,
      absent: rows.filter((r) => r.status === "ABSENT").length,
      late: rows.filter((r) => r.status === "LATE").length,
      excused: rows.filter((r) => r.status === "EXCUSED").length,
    };
  }, [rows]);

  const selectedSubject = subjects.find(
    (subject) => subject.id === subjectId
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading attendance...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/faculty"
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Faculty Dashboard
            </Link>

            <h1 className="text-3xl font-bold tracking-tight">
              Attendance Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Mark and manage student attendance for your assigned subjects.
            </p>
          </div>

          <button
            type="button"
            onClick={saveAttendance}
            disabled={saving || rows.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Subject
              </label>

              <select
                value={subjectId}
                onChange={(event) =>
                  setSubjectId(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
              >
                <option value="">Select subject</option>

                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code
                      ? `${subject.code} — ${subject.name}`
                      : subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Attendance Date
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                {selectedSubject?.name || "Select a subject"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {date || "No date selected"} · {rows.length} students
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => markAll("PRESENT")}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
              >
                Mark All Present
              </button>

              <button
                type="button"
                onClick={() => markAll("ABSENT")}
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
              >
                Mark All Absent
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <Users className="mb-3 h-5 w-5 text-indigo-400" />
            <p className="text-2xl font-bold">{counts.total}</p>
            <p className="text-xs text-slate-500">Total Students</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <Check className="mb-3 h-5 w-5 text-emerald-400" />
            <p className="text-2xl font-bold text-emerald-300">
              {counts.present}
            </p>
            <p className="text-xs text-emerald-200/60">Present</p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <X className="mb-3 h-5 w-5 text-red-400" />
            <p className="text-2xl font-bold text-red-300">
              {counts.absent}
            </p>
            <p className="text-xs text-red-200/60">Absent</p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <Clock3 className="mb-3 h-5 w-5 text-amber-400" />
            <p className="text-2xl font-bold text-amber-300">
              {counts.late}
            </p>
            <p className="text-xs text-amber-200/60">Late</p>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
            <CheckCircle2 className="mb-3 h-5 w-5 text-sky-400" />
            <p className="text-2xl font-bold text-sky-300">
              {counts.excused}
            </p>
            <p className="text-xs text-sky-200/60">Excused</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Student Attendance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select the attendance status for each student.
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search student..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 lg:w-72"
            />
          </div>

          {filteredRows.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
              <Users className="mb-3 h-8 w-8 text-slate-600" />
              <p className="font-semibold text-slate-300">
                No students found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or select a different subject.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Roll Number</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Remarks</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredRows.map((student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-white">
                            {student.name}
                          </p>
                          {student.email && (
                            <p className="mt-1 text-xs text-slate-500">
                              {student.email}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {student.rollNumber || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((option) => {
                            const active =
                              student.status === option.value;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                  updateStatus(
                                    student.id,
                                    option.value
                                  )
                                }
                                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                  active
                                    ? option.value === "PRESENT"
                                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                                      : option.value === "ABSENT"
                                        ? "border-red-500/40 bg-red-500/20 text-red-300"
                                        : option.value === "LATE"
                                          ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                                          : "border-sky-500/40 bg-sky-500/20 text-sky-300"
                                    : "border-white/10 bg-white/[0.03] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="text"
                          value={student.remarks}
                          onChange={(event) =>
                            updateRemarks(
                              student.id,
                              event.target.value
                            )
                          }
                          placeholder="Optional remark"
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-700 focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {filteredRows.length} of {rows.length} students shown
            </p>

            <button
              type="button"
              onClick={saveAttendance}
              disabled={saving || rows.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

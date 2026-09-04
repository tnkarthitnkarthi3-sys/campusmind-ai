"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users,
  UserCircle,
} from "lucide-react";

type Faculty = {
  id: string;
  name: string;
  email: string;
  role?: string;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
};

type FacultySubject = {
  id: string;
  name: string;
  code: string;
  credits?: number;
  course?: {
    id: string;
    name: string;
    code: string;
  } | null;
  semester?: {
    id: string;
    name: string;
    number: number;
  } | null;
};

type FacultyDashboardData = {
  faculty: Faculty | null;
  subjects: any[];
  timetable: any[];
  exams: any[];
  assignments: any[];
  students: any[];
  notes: any[];
};

async function fetchFacultyApi<T = any>(
  endpoint: string,
): Promise<T> {
  const response = await fetch(endpoint, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed: ${response.status}`,
    );
  }

  return data;
}

function extractArray(
  data: any,
  keys: string[],
): any[] {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

export default function FacultyDashboardPage() {
  const [data, setData] =
    useState<FacultyDashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      /*
       * All Faculty APIs are loaded together.
       * Same authenticated faculty session is used
       * through campusmind_user_id cookie.
       */
      const [
        profileResponse,
        academicResponse,
        subjectsResponse,
        studentsResponse,
        notesResponse,
      ] = await Promise.all([
        fetchFacultyApi("/api/faculty/profile"),
        fetchFacultyApi("/api/faculty/academic"),
        fetchFacultyApi("/api/faculty/subjects"),
        fetchFacultyApi("/api/faculty/students"),
        fetchFacultyApi("/api/faculty/notes"),
      ]);

      const faculty =
        profileResponse?.faculty ??
        academicResponse?.faculty ??
        null;

      const subjects =
        extractArray(subjectsResponse, [
          "subjects",
          "facultySubjects",
        ]);

      const academicSubjects =
        extractArray(academicResponse, [
          "subjects",
        ]);

      const timetable =
        extractArray(academicResponse, [
          "timetable",
          "timetables",
          "entries",
        ]);

      const exams =
        extractArray(academicResponse, [
          "exams",
          "academicExams",
        ]);

      const assignments =
        extractArray(academicResponse, [
          "assignments",
          "academicAssignments",
        ]);

      const students =
        extractArray(studentsResponse, [
          "students",
        ]);

      const academicStudents =
        extractArray(academicResponse, [
          "students",
        ]);

      const notes =
        extractArray(notesResponse, [
          "notes",
        ]);

      setData({
        faculty,
        subjects:
          subjects.length > 0
            ? subjects
            : academicSubjects,
        timetable,
        exams,
        assignments,
        students:
          students.length > 0
            ? students
            : academicStudents,
        notes,
      });
    } catch (error) {
      console.error(
        "Faculty dashboard API error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load Faculty Portal",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const upcomingExams = useMemo(
    () =>
      [...(data?.exams || [])].sort(
        (a, b) =>
          new Date(a.examDate).getTime() -
          new Date(b.examDate).getTime(),
      ),
    [data?.exams],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-48 rounded-3xl bg-white" />

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl bg-white"
                />
              ),
            )}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="h-80 rounded-2xl bg-white" />
            <div className="h-80 rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <span className="text-2xl">!</span>
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to load Faculty Portal
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const faculty = data?.faculty;

  const subjects = data?.subjects || [];
  const timetable = data?.timetable || [];
  const exams = data?.exams || [];
  const assignments = data?.assignments || [];
  const students = data?.students || [];
  const notes = data?.notes || [];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

        {/* HEADER */}
        <section className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <GraduationCap className="h-5 w-5 text-cyan-300" />
              </div>

              <div>
                <p className="text-sm font-bold">
                  CampusMind AI
                </p>

                <p className="text-xs text-slate-400">
                  Faculty Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />

              <Link
                href="/faculty/profile"
                className="hidden items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 sm:flex"
              >
                <UserCircle className="h-4 w-4" />
                Profile
              </Link>

              <div className="hidden h-8 w-px bg-white/10 sm:block" />

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">
                  {faculty?.name || "Faculty"}
                </p>

                <p className="text-xs text-slate-400">
                  {faculty?.department?.code ||
                    "Faculty Account"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-sm font-bold text-cyan-200 ring-1 ring-cyan-400/20">
                {(faculty?.name || "F")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          </div>

          <div className="p-7">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  <GraduationCap className="h-4 w-4" />
                  Faculty Portal
                </div>

                <h1 className="mt-4 text-3xl font-bold">
                  Welcome, {faculty?.name || "Faculty"}
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                  Manage your academic responsibilities
                  and view official college data.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5 lg:min-w-[280px]">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Department
                </p>

                <p className="mt-2 font-semibold">
                  {faculty?.department?.name ||
                    "Not assigned"}
                </p>

                <p className="text-sm text-slate-400">
                  {faculty?.department?.code || "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Assigned Subjects"
            value={subjects.length}
          />

          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Department Students"
            value={students.length}
          />

          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Timetable Sessions"
            value={timetable.length}
          />

          <StatCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            label="Examinations"
            value={exams.length}
          />

          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Faculty Notes"
            value={notes.length}
          />
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickLink
            href="/faculty/profile"
            icon={<UserCircle />}
            title="My Profile"
            description="View and update profile"
          />

          <QuickLink
            href="/faculty/subjects"
            icon={<BookOpen />}
            title="My Subjects"
            description="View assigned subjects"
          />

          <QuickLink
            href="/faculty/students"
            icon={<Users />}
            title="Students"
            description="View department students"
          />

          <QuickLink
            href="/faculty/notes"
            icon={<FileText />}
            title="Faculty Notes"
            description="Manage academic notes"
          />
        </section>

        {/* SUBJECTS + TIMETABLE */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel
            title="My Assigned Subjects"
            icon={<BookOpen className="h-5 w-5" />}
          >
            {subjects.length === 0 ? (
              <Empty text="No subjects assigned yet." />
            ) : (
              <div className="space-y-3">
                {subjects.slice(0, 8).map(
                  (subject: any) => (
                    <div
                      key={subject.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {subject.name ||
                              subject.subject?.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {subject.code ||
                              subject.subject?.code ||
                              "-"}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            {subject.course?.name ||
                              subject.subject?.course?.name ||
                              "-"}
                            {" · "}
                            {subject.semester?.name ||
                              subject.subject?.semester?.name ||
                              "-"}
                          </p>
                        </div>

                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {subject.credits ||
                            subject.subject?.credits ||
                            0}{" "}
                          Credits
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </Panel>

          <Panel
            title="Teaching Timetable"
            icon={<CalendarDays className="h-5 w-5" />}
          >
            {timetable.length === 0 ? (
              <Empty text="No timetable sessions assigned." />
            ) : (
              <div className="space-y-3">
                {timetable.slice(0, 8).map(
                  (item: any) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.subject?.name ||
                              item.subjectName ||
                              "Subject"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.day || "-"}
                            {" · "}
                            {item.startTime || "-"}
                            {" - "}
                            {item.endTime || "-"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-700">
                            {item.room ||
                              "Room not assigned"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.course?.code ||
                              item.courseId ||
                              ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </Panel>
        </section>

        {/* EXAMS + ASSIGNMENTS */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel
            title="Upcoming Examinations"
            icon={<GraduationCap className="h-5 w-5" />}
          >
            {upcomingExams.length === 0 ? (
              <Empty text="No examinations assigned to your subjects." />
            ) : (
              <div className="space-y-3">
                {upcomingExams.slice(0, 8).map(
                  (exam: any) => (
                    <div
                      key={exam.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {exam.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {exam.type ||
                              exam.subject?.name ||
                              "Examination"}
                          </p>
                        </div>

                        <div className="text-right">
                          {exam.examDate && (
                            <p className="text-sm font-bold text-slate-900">
                              {new Date(
                                exam.examDate,
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                },
                              )}
                            </p>
                          )}

                          <p className="text-xs text-slate-500">
                            {exam.startTime || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </Panel>

          <Panel
            title="Academic Assignments"
            icon={<FileText className="h-5 w-5" />}
          >
            {assignments.length === 0 ? (
              <Empty text="No assignments available." />
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 8).map(
                  (assignment: any) => (
                    <div
                      key={assignment.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {assignment.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {assignment.status ||
                              "Published"}
                            {" · "}
                            {assignment.priority ||
                              "MEDIUM"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-500">
                            Due
                          </p>

                          {assignment.dueDate && (
                            <p className="text-sm font-bold text-slate-900">
                              {new Date(
                                assignment.dueDate,
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                },
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </Panel>
        </section>

        {/* STUDENTS */}
        <section className="mt-8">
          <Panel
            title="Department Students"
            icon={<Users className="h-5 w-5" />}
          >
            {students.length === 0 ? (
              <Empty text="No students found in your department." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Email
                      </th>

                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Course
                      </th>

                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Semester
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students
                      .slice(0, 20)
                      .map((student: any) => (
                        <tr
                          key={student.id}
                          className="border-b border-slate-100"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {student.name}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {student.email}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {student.course?.code ||
                              student.course?.name ||
                              student.courseId ||
                              "-"}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {student.semester?.name ||
                              student.semester?.number ||
                              student.semesterId ||
                              "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </section>

        {/* NOTES */}
        <section className="mt-8">
          <Panel
            title="Recent Faculty Notes"
            icon={<FileText className="h-5 w-5" />}
          >
            {notes.length === 0 ? (
              <Empty text="No faculty notes available." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {notes.slice(0, 6).map(
                  (note: any) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {note.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {note.noteType ||
                              "LECTURE"}
                          </p>
                        </div>

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {note.status ||
                            "PUBLISHED"}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </Panel>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
          {icon}
        </div>

        <div>
          <p className="font-semibold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
          {icon}
        </div>

        <h2 className="font-bold text-slate-900">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
      <p className="text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}
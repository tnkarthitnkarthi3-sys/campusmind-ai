"use client";

import { useEffect, useMemo, useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";

type FacultyData = {
  success: boolean;

  faculty?: {
    id: string;
    name: string;
    email: string;

    department?: {
      id: string;
      name: string;
      code: string;
    } | null;
  };

  subjects?: any[];
  timetable?: any[];
  exams?: any[];
  assignments?: any[];
  students?: any[];
};

export default function FacultyDashboardPage() {
  const [data, setData] =
    useState<FacultyData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function load() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/faculty/academic",
        {
          cache: "no-store",
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.message ||
            "Unable to load faculty dashboard"
        );
      }

      setData(json);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load faculty dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const upcomingExams =
    useMemo(
      () =>
        [...(data?.exams || [])].sort(
          (a, b) =>
            new Date(a.examDate).getTime() -
            new Date(b.examDate).getTime()
        ),
      [data]
    );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-36 rounded-3xl bg-white" />

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl bg-white"
                />
              )
            )}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load Faculty Portal
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={load}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const subjects =
    data?.subjects || [];

  const timetable =
    data?.timetable || [];

  const exams =
    data?.exams || [];

  const assignments =
    data?.assignments || [];

  const students =
    data?.students || [];

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

              <div className="hidden h-8 w-px bg-white/10 sm:block" />

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">
                  {data?.faculty?.name || "Faculty"}
                </p>

                <p className="text-xs text-slate-400">
                  {data?.faculty?.department?.code || "Faculty Account"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-sm font-bold text-cyan-200 ring-1 ring-cyan-400/20">
                {(data?.faculty?.name || "F")
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
                  Welcome,{" "}
                  {data?.faculty?.name || "Faculty"}
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
                  {data?.faculty?.department?.name ||
                    "Not assigned"}
                </p>

                <p className="text-sm text-slate-400">
                  {data?.faculty?.department?.code || "-"}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* STATS */}

        <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={
              <BookOpen className="h-5 w-5" />
            }
            label="Assigned Subjects"
            value={subjects.length}
          />

          <StatCard
            icon={
              <Users className="h-5 w-5" />
            }
            label="Department Students"
            value={students.length}
          />

          <StatCard
            icon={
              <CalendarDays className="h-5 w-5" />
            }
            label="Timetable Sessions"
            value={timetable.length}
          />

          <StatCard
            icon={
              <ClipboardCheck className="h-5 w-5" />
            }
            label="Examinations"
            value={exams.length}
          />

        </section>


        {/* QUICK ACTIONS */}

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

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
            description="View students"
          />

          <QuickLink
            href="/faculty/timetable"
            icon={<CalendarDays />}
            title="Timetable"
            description="View teaching schedule"
          />

          <QuickLink
            href="/faculty/assignments"
            icon={<FileText />}
            title="Assignments"
            description="View academic assignments"
          />

        </section>


        {/* SUBJECTS + TIMETABLE */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          <Panel
            title="My Assigned Subjects"
            icon={
              <BookOpen className="h-5 w-5" />
            }
          >
            {subjects.length === 0 ? (
              <Empty text="No subjects assigned yet." />
            ) : (
              <div className="space-y-3">

                {subjects.map(
                  (subject) => (
                    <div
                      key={subject.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">

                        <div>
                          <p className="font-semibold text-slate-900">
                            {subject.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {subject.code}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            {subject.course?.name}
                            {" Â· "}
                            {subject.semester?.name}
                          </p>
                        </div>

                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {subject.credits} Credits
                        </span>

                      </div>
                    </div>
                  )
                )}

              </div>
            )}
          </Panel>


          <Panel
            title="Teaching Timetable"
            icon={
              <CalendarDays className="h-5 w-5" />
            }
          >
            {timetable.length === 0 ? (
              <Empty text="No timetable sessions assigned." />
            ) : (
              <div className="space-y-3">

                {timetable
                  .slice(0, 8)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex justify-between gap-4">

                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.subject?.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.day}
                            {" Â· "}
                            {item.startTime}
                            {" - "}
                            {item.endTime}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-700">
                            {item.room ||
                              "Room not assigned"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.course?.code ||
                              ""}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}

              </div>
            )}
          </Panel>

        </section>


        {/* EXAMS + ASSIGNMENTS */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          <Panel
            title="Upcoming Examinations"
            icon={
              <GraduationCap className="h-5 w-5" />
            }
          >
            {upcomingExams.length === 0 ? (
              <Empty text="No examinations assigned to your subjects." />
            ) : (
              <div className="space-y-3">

                {upcomingExams
                  .slice(0, 8)
                  .map((exam) => (
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
                            {exam.type}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            {new Date(
                              exam.examDate
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                              }
                            )}
                          </p>

                          <p className="text-xs text-slate-500">
                            {exam.startTime}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}

              </div>
            )}
          </Panel>


          <Panel
            title="Academic Assignments"
            icon={
              <FileText className="h-5 w-5" />
            }
          >
            {assignments.length === 0 ? (
              <Empty text="No assignments available." />
            ) : (
              <div className="space-y-3">

                {assignments
                  .slice(0, 8)
                  .map((assignment) => (
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
                            {assignment.status}
                            {" Â· "}
                            {assignment.priority}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-500">
                            Due
                          </p>

                          <p className="text-sm font-bold text-slate-900">
                            {new Date(
                              assignment.dueDate
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                              }
                            )}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}

              </div>
            )}
          </Panel>

        </section>


        {/* STUDENTS */}

        <section className="mt-8">
          <Panel
            title="Department Students"
            icon={
              <Users className="h-5 w-5" />
            }
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
                      .map((student) => (
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
                            {student.courseId ||
                              "-"}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {student.semesterId ||
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

        <div className="rounded-xl bg-slate-100 p-3 text-slate-700 group-hover:bg-slate-900 group-hover:text-white">
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


function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
      <p className="text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}
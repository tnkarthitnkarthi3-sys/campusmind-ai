"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Megaphone,
  Timer,
  Users,
} from "lucide-react";

type AcademicData = {
  success: boolean;
  configured?: boolean;
  message?: string;

  student?: {
    id: string;
    name: string;
    email: string;
  };

  department?: {
    id: string;
    name: string;
    code: string;
  } | null;

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

  subjects?: any[];
  timetable?: any[];
  exams?: any[];
  assignments?: any[];
  attendance?: any[];
  notes?: any[];
  announcements?: any[];
  onlineTests?: any[];
};

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AcademicHubPage() {
  const [data, setData] = useState<AcademicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const response = await fetch("/api/student/academic", {
          cache: "no-store",
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(
            json.message || "Unable to load academic data"
          );
        }

        setData(json);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load academic data"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const attendancePercent = useMemo(() => {
    const records = data?.attendance ?? [];

    if (!records.length) return 0;

    const present = records.filter(
      (item) => item.status === "PRESENT"
    ).length;

    return Math.round((present / records.length) * 100);
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-10 w-72 rounded bg-slate-200" />
          <div className="mt-3 h-5 w-96 rounded bg-slate-200" />

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load academic data
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const subjects = data?.subjects ?? [];
  const timetable = data?.timetable ?? [];
  const exams = data?.exams ?? [];
  const assignments = data?.assignments ?? [];
  const announcements = data?.announcements ?? [];
  const onlineTests = data?.onlineTests ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Header */}
        <section className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <GraduationCap className="h-4 w-4" />
                Official Academic Portal
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Welcome, {data?.student?.name || "Student"}
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Your official academic information from CampusMind AI.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 lg:min-w-[300px]">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Academic Profile
              </p>

              <p className="mt-2 font-semibold">
                {data?.department?.name || "Department not assigned"}
              </p>

              <p className="text-sm text-slate-300">
                {data?.course?.name || "Course not assigned"}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {data?.semester?.name || "Semester not assigned"}
              </p>
            </div>
          </div>
        </section>

        {!data?.configured && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-900">
              Academic profile incomplete
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Your department, course and semester must be assigned by
              the administrator before official academic information
              can be displayed.
            </p>
          </section>
        )}

        {/* Stats */}
        <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Subjects"
            value={subjects.length}
          />

          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Timetable Sessions"
            value={timetable.length}
          />

          <StatCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            label="Upcoming Exams"
            value={exams.length}
          />

          <StatCard
            icon={<Timer className="h-5 w-5" />}
            label="Attendance"
            value={`${attendancePercent}%`}
          />
        </section>

        {/* Quick navigation */}
        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickLink
            href="/attendance"
            icon={<ClipboardCheck />}
            title="Attendance"
            description="View your attendance"
          />

          <QuickLink
            href="/exams"
            icon={<GraduationCap />}
            title="Exams"
            description="View examination schedule"
          />

          <QuickLink
            href="/assignments"
            icon={<FileText />}
            title="Assignments"
            description="View assignments and deadlines"
          />

          <QuickLink
            href="/notes"
            icon={<BookOpen />}
            title="Notes"
            description="Access your academic notes"
          />
        </section>

        {/* Academic overview */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Subjects */}
          <Panel
            title="My Subjects"
            icon={<BookOpen className="h-5 w-5" />}
          >
            {subjects.length === 0 ? (
              <Empty text="No subjects assigned yet." />
            ) : (
              <div className="space-y-3">
                {subjects.slice(0, 8).map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {subject.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {subject.code}
                      </p>
                    </div>

                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {subject.credits} Credits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Timetable */}
          <Panel
            title="Official Timetable"
            icon={<CalendarDays className="h-5 w-5" />}
          >
            {timetable.length === 0 ? (
              <Empty text="No timetable published yet." />
            ) : (
              <div className="space-y-3">
                {timetable.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.subject?.name || "Subject"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.day} · {item.startTime} -{" "}
                          {item.endTime}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-700">
                          {item.room || "Room not assigned"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.faculty?.name || "Faculty"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        {/* Exams + Assignments */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel
            title="Upcoming Official Exams"
            icon={<GraduationCap className="h-5 w-5" />}
          >
            {exams.length === 0 ? (
              <Empty text="No upcoming exams published." />
            ) : (
              <div className="space-y-3">
                {exams.slice(0, 8).map((exam) => (
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
                          {formatDate(exam.examDate)}
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
            title="Official Assignments"
            icon={<FileText className="h-5 w-5" />}
          >
            {assignments.length === 0 ? (
              <Empty text="No published assignments." />
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 8).map((assignment) => (
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
                          Priority: {assignment.priority}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-700">
                          Due
                        </p>

                        <p className="text-sm font-bold text-slate-900">
                          {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        {/* Announcements + Tests */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel
            title="Announcements"
            icon={<Megaphone className="h-5 w-5" />}
          >
            {announcements.length === 0 ? (
              <Empty text="No announcements available." />
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.title}
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {item.message ||
                        item.description ||
                        "Official college announcement"}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Online Tests"
            icon={<Timer className="h-5 w-5" />}
          >
            {onlineTests.length === 0 ? (
              <Empty text="No online tests published." />
            ) : (
              <div className="space-y-3">
                {onlineTests.slice(0, 6).map((test) => (
                  <div
                    key={test.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {test.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Duration: {test.duration} minutes
                        </p>
                      </div>

                      <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Available
                      </span>
                    </div>
                  </div>
                ))}
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
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
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
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
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
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}
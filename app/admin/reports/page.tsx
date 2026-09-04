"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  ClipboardCheck,
  FileText,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

type ReportData = {
  people: {
    students: number;
    faculty: number;
  };
  academic: {
    departments: number;
    courses: number;
    semesters: number;
    subjects: number;
  };
  management: {
    assignments: number;
    notes: number;
    announcements: number;
    exams: number;
    onlineTests: number;
    timetable: number;
  };
  generatedAt: string;
};

export default function ReportsPage() {
  const [data, setData] =
    useState<ReportData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/reports",
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to load reports"
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-indigo-600">
              System Analytics
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Reports
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Institutional overview and administrative metrics.
            </p>
          </div>

          <button
            onClick={loadReports}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading || !data ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-500">
            Loading reports...
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                People
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <ReportCard
                  icon={<Users size={20} />}
                  label="Students"
                  value={data.people.students}
                />

                <ReportCard
                  icon={<GraduationCap size={20} />}
                  label="Faculty"
                  value={data.people.faculty}
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Academic Structure
              </h2>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ReportCard
                  icon={<Building2 size={20} />}
                  label="Departments"
                  value={data.academic.departments}
                />

                <ReportCard
                  icon={<BookOpen size={20} />}
                  label="Courses"
                  value={data.academic.courses}
                />

                <ReportCard
                  icon={<CalendarDays size={20} />}
                  label="Semesters"
                  value={data.academic.semesters}
                />

                <ReportCard
                  icon={<FileText size={20} />}
                  label="Subjects"
                  value={data.academic.subjects}
                />
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Academic Management
              </h2>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ReportCard
                  icon={<ClipboardCheck size={20} />}
                  label="Assignments"
                  value={data.management.assignments}
                />

                <ReportCard
                  icon={<FileText size={20} />}
                  label="Notes"
                  value={data.management.notes}
                />

                <ReportCard
                  icon={<CalendarDays size={20} />}
                  label="Exams"
                  value={data.management.exams}
                />

                <ReportCard
                  icon={<ClipboardCheck size={20} />}
                  label="Online Tests"
                  value={data.management.onlineTests}
                />

                <ReportCard
                  icon={<CalendarDays size={20} />}
                  label="Timetable Entries"
                  value={data.management.timetable}
                />

                <ReportCard
                  icon={<BarChart3 size={20} />}
                  label="Announcements"
                  value={data.management.announcements}
                />
              </div>
            </section>

            <p className="mt-8 text-xs text-slate-400">
              Last generated:{" "}
              {new Date(
                data.generatedAt
              ).toLocaleString("en-IN")}
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function ReportCard({
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
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
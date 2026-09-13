"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  StickyNote,
  Users,
  XCircle,
} from "lucide-react";

type CheckStatus = "PASS" | "FAIL" | "CHECKING";

type FacultyCheck = {
  id: string;
  name: string;
  endpoint: string;
  status: CheckStatus;
  message: string;
  count?: number;
};

type FacultyInfo = {
  name: string;
  email: string;
  role: string;
};

type ApiResponse = {
  success?: boolean;
  authenticated?: boolean;
  message?: string;
  faculty?: FacultyInfo;
  summary?: {
    total: number;
    passed: number;
    failed: number;
    percentage: number;
    duration: number;
  };
  checks?: FacultyCheck[];
};

const defaultChecks: FacultyCheck[] = [
  {
    id: "session",
    name: "Faculty Login / Session",
    endpoint: "/api/auth/me",
    status: "CHECKING",
    message: "Checking faculty authentication...",
  },
  {
    id: "dashboard",
    name: "Faculty Dashboard",
    endpoint: "/faculty",
    status: "CHECKING",
    message: "Checking faculty dashboard...",
  },
  {
    id: "students",
    name: "Students",
    endpoint: "/api/faculty/students",
    status: "CHECKING",
    message: "Checking student access...",
  },
  {
    id: "subjects",
    name: "Subjects",
    endpoint: "/api/faculty/subjects",
    status: "CHECKING",
    message: "Checking faculty subjects...",
  },
  {
    id: "notes",
    name: "Notes",
    endpoint: "/api/faculty/notes",
    status: "CHECKING",
    message: "Checking faculty notes...",
  },
  {
    id: "academic",
    name: "Academic Management",
    endpoint: "/api/faculty/academic",
    status: "CHECKING",
    message: "Checking academic management...",
  },
];

export default function FacultyE2EPage() {
  const [checks, setChecks] =
    useState<FacultyCheck[]>(defaultChecks);

  const [faculty, setFaculty] =
    useState<FacultyInfo | null>(null);

  const [summary, setSummary] = useState({
    total: 6,
    passed: 0,
    failed: 0,
    percentage: 0,
    duration: 0,
  });

  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState("");

  const runTests = useCallback(async () => {
    setRunning(true);

    setChecks(
      defaultChecks.map((check) => ({
        ...check,
        status: "CHECKING",
      }))
    );

    setSummary({
      total: 6,
      passed: 0,
      failed: 0,
      percentage: 0,
      duration: 0,
    });

    setStartedAt(new Date().toLocaleTimeString());

    try {
      const response = await fetch("/api/faculty/e2e", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const data =
        (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Faculty E2E request failed (${response.status})`
        );
      }

      if (data.faculty) {
        setFaculty(data.faculty);
      }

      if (data.summary) {
        setSummary(data.summary);
      }

      if (data.checks) {
        setChecks(data.checks);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to run faculty E2E test.";

      setChecks(
        defaultChecks.map((check) => ({
          ...check,
          status: "FAIL",
          message,
        }))
      );

      setSummary({
        total: 6,
        passed: 0,
        failed: 6,
        percentage: 0,
        duration: 0,
      });
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    runTests();
  }, [runTests]);

  const allPassed =
    summary.total > 0 &&
    summary.failed === 0 &&
    summary.passed === summary.total;

  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#172d4b] via-[#0c1a2d] to-[#060d17] p-6 shadow-2xl sm:p-8">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-black tracking-wide text-cyan-300">
                <ShieldCheck className="h-5 w-5" />
                CAMPUSMIND AI • FACULTY QA CENTER
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Faculty End-to-End Test
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Live verification of faculty authentication,
                dashboard access, students, subjects, notes and
                academic management.
              </p>

              {faculty && (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <GraduationCap className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      {faculty.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {faculty.email}
                    </p>
                  </div>

                  <span className="ml-2 rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] font-black text-cyan-300">
                    {faculty.role}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={runTests}
              disabled={running}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-cyan-400/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  running ? "animate-spin" : ""
                }`}
              />

              {running
                ? "Running Tests..."
                : "Run All Tests"}
            </button>
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <SummaryCard
            icon={<Activity className="h-5 w-5" />}
            title="Overall"
            value={`${summary.percentage}%`}
            text={
              allPassed
                ? "Everything passed"
                : running
                  ? "Tests running"
                  : "Attention required"
            }
          />

          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Passed"
            value={String(summary.passed)}
            text="Working features"
          />

          <SummaryCard
            icon={<XCircle className="h-5 w-5" />}
            title="Failed"
            value={String(summary.failed)}
            text="Needs attention"
          />

          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Duration"
            value={`${summary.duration}ms`}
            text="API verification"
          />

          <SummaryCard
            icon={<GraduationCap className="h-5 w-5" />}
            title="Role"
            value={faculty?.role ?? "—"}
            text={
              startedAt
                ? `Started ${startedAt}`
                : "Waiting"
            }
          />

        </section>

        {/* SUCCESS */}
        {allPassed && !running && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-200">

            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-black">
                Faculty E2E verification completed successfully.
              </p>

              <p className="mt-1 text-sm text-emerald-200/70">
                Authentication, dashboard, students, subjects,
                notes and academic management are working.
              </p>
            </div>
          </div>
        )}

        {/* FAILURE */}
        {!running && summary.failed > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-red-200">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-black">
                {summary.failed} faculty feature(s) failed.
              </p>

              <p className="mt-1 text-sm text-red-200/70">
                Check the failing module below before moving
                to admin testing.
              </p>
            </div>
          </div>
        )}

        {/* TEST LIST */}
        <section className="mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] shadow-2xl">

          <div className="border-b border-white/10 px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">

              <ShieldCheck className="h-5 w-5 text-cyan-300" />

              <div>
                <h2 className="font-black">
                  Faculty Feature Verification
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Real database-backed faculty verification.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {checks.map((check, index) => (
              <FacultyTestRow
                key={check.id}
                index={index + 1}
                check={check}
              />
            ))}
          </div>
        </section>

        {/* CHECKLIST */}
        <section className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-xl">

          <h2 className="font-black">
            Faculty E2E Checklist
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Core faculty workflow that must pass before production.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">

            <Checklist
              icon={<ShieldCheck />}
              text="Faculty login session is valid"
            />

            <Checklist
              icon={<Activity />}
              text="Faculty dashboard loads"
            />

            <Checklist
              icon={<Users />}
              text="Students are accessible"
            />

            <Checklist
              icon={<BookOpen />}
              text="Faculty subjects are accessible"
            />

            <Checklist
              icon={<StickyNote />}
              text="Faculty notes are accessible"
            />

            <Checklist
              icon={<GraduationCap />}
              text="Academic management is connected"
            />

          </div>
        </section>

        <p className="mt-7 text-center text-xs text-slate-600">
          CampusMind AI • Faculty Runtime QA • Production-style verification
        </p>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">

      <div className="flex items-center gap-2 text-cyan-300">
        {icon}

        <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
          {title}
        </span>
      </div>

      <p className="mt-4 truncate text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 truncate text-xs text-slate-500">
        {text}
      </p>
    </div>
  );
}

function FacultyTestRow({
  index,
  check,
}: {
  index: number;
  check: FacultyCheck;
}) {
  const pass = check.status === "PASS";
  const fail = check.status === "FAIL";

  return (
    <div className="px-6 py-5 transition hover:bg-white/[0.02] sm:px-7">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex min-w-0 items-start gap-4">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xs font-black text-slate-500">
            {String(index).padStart(2, "0")}
          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="font-black">
                {check.name}
              </h3>

              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-500">
                {check.endpoint}
              </span>

            </div>

            <p
              className={`mt-2 text-sm ${
                fail
                  ? "text-red-300"
                  : pass
                    ? "text-slate-400"
                    : "text-slate-500"
              }`}
            >
              {check.message}
            </p>

          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">

          {typeof check.count === "number" && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">
              {check.count} records
            </span>
          )}

          <span
            className={`inline-flex min-w-[82px] items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${
              pass
                ? "bg-emerald-400/10 text-emerald-300"
                : fail
                  ? "bg-red-400/10 text-red-300"
                  : "bg-cyan-400/10 text-cyan-300"
            }`}
          >

            {pass ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : fail ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            )}

            {check.status}

          </span>
        </div>
      </div>
    </div>
  );
}

function Checklist({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">

      <span className="text-cyan-300">
        {icon}
      </span>

      <span className="text-sm text-slate-300">
        {text}
      </span>

      <CheckCircle2 className="ml-auto h-4 w-4 text-cyan-300" />
    </div>
  );
}
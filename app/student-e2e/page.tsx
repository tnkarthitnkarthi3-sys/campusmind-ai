"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

type TestStatus = "PASS" | "FAIL" | "CHECKING";

type TestItem = {
  id: string;
  name: string;
  endpoint: string;
  status: TestStatus;
  message: string;
  count?: number;
  duration?: number;
};

const initialTests: TestItem[] = [
  {
    id: "session",
    name: "Student Login / Session",
    endpoint: "/api/auth/me",
    status: "CHECKING",
    message: "Checking student authentication...",
  },
  {
    id: "dashboard",
    name: "Dashboard Data",
    endpoint: "/api/dashboard",
    status: "CHECKING",
    message: "Checking dashboard data...",
  },
  {
    id: "attendance",
    name: "Attendance",
    endpoint: "/api/attendance",
    status: "CHECKING",
    message: "Checking attendance records...",
  },
  {
    id: "assignments",
    name: "Assignments",
    endpoint: "/api/student/official-assignments",
    status: "CHECKING",
    message: "Checking assignments...",
  },
  {
    id: "exams",
    name: "Exams",
    endpoint: "/api/student/exams",
    status: "CHECKING",
    message: "Checking exams...",
  },
  {
    id: "notes",
    name: "Notes",
    endpoint: "/api/student/official-notes",
    status: "CHECKING",
    message: "Checking notes...",
  },
  {
    id: "timetable",
    name: "Timetable",
    endpoint: "/api/student/timetable",
    status: "CHECKING",
    message: "Checking timetable...",
  },
  {
    id: "notifications",
    name: "Notifications",
    endpoint: "/api/notifications",
    status: "CHECKING",
    message: "Checking notifications...",
  },
  {
    id: "profile",
    name: "Student Profile",
    endpoint: "/api/student/profile",
    status: "CHECKING",
    message: "Checking student profile...",
  },
];

function extractArray(data: unknown, keys: string[]) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const object = data as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(object[key])) {
      return object[key] as unknown[];
    }
  }

  return [];
}

function extractCount(data: unknown, keys: string[]) {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const object = data as Record<string, unknown>;

  for (const key of keys) {
    const value = object[key];

    if (typeof value === "number") {
      return value;
    }
  }

  return undefined;
}

export default function StudentE2EPage() {
  const [tests, setTests] = useState<TestItem[]>(initialTests);
  const [running, setRunning] = useState(false);
  const [student, setStudent] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [startedAt, setStartedAt] = useState("");

  const runTests = useCallback(async () => {
    setRunning(true);
    setStartedAt(new Date().toLocaleTimeString());

    setTests(
      initialTests.map((test) => ({
        ...test,
        status: "CHECKING",
        message: `Checking ${test.name.toLowerCase()}...`,
      }))
    );

    const endpoints = [
      {
        id: "session",
        url: "/api/auth/me",
        arrayKeys: [],
        countKeys: [],
      },
      {
        id: "dashboard",
        url: "/api/dashboard",
        arrayKeys: [
          "assignments",
          "exams",
          "notifications",
          "timetable",
          "upcoming",
        ],
        countKeys: [],
      },
      {
        id: "attendance",
        url: "/api/attendance",
        arrayKeys: ["records", "attendance", "items", "data"],
        countKeys: ["total", "totalClasses"],
      },
      {
        id: "assignments",
        url: "/api/student/official-assignments",
        arrayKeys: ["assignments", "items", "data"],
        countKeys: ["total"],
      },
      {
        id: "exams",
        url: "/api/student/exams",
        arrayKeys: ["exams", "items", "data"],
        countKeys: ["total"],
      },
      {
        id: "notes",
        url: "/api/student/official-notes",
        arrayKeys: ["notes", "items", "data"],
        countKeys: ["total"],
      },
      {
        id: "timetable",
        url: "/api/student/timetable",
        arrayKeys: ["timetable", "entries", "items", "data"],
        countKeys: ["total"],
      },
      {
        id: "notifications",
        url: "/api/notifications",
        arrayKeys: ["notifications", "items", "data"],
        countKeys: ["total"],
      },
      {
        id: "profile",
        url: "/api/student/profile",
        arrayKeys: [],
        countKeys: [],
      },
    ];

    for (const endpoint of endpoints) {
      const started = performance.now();

      try {
        const response = await fetch(endpoint.url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const duration = Math.round(performance.now() - started);

        let data: unknown = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (endpoint.id === "session") {
          if (!response.ok) {
            throw new Error(
              `Authentication failed (${response.status})`
            );
          }

          const object =
            data && typeof data === "object"
              ? (data as Record<string, unknown>)
              : {};

          const currentUser =
            object.user &&
            typeof object.user === "object"
              ? (object.user as Record<string, unknown>)
              : object;

          const role =
            typeof currentUser.role === "string"
              ? currentUser.role
              : "";

          const name =
            typeof currentUser.name === "string"
              ? currentUser.name
              : "Student";

          const email =
            typeof currentUser.email === "string"
              ? currentUser.email
              : "";

          if (role !== "STUDENT") {
            throw new Error(
              `Logged-in role is ${role || "UNKNOWN"}, expected STUDENT`
            );
          }

          setStudent({
            name,
            email,
            role,
          });

          setTests((current) =>
            current.map((test) =>
              test.id === endpoint.id
                ? {
                    ...test,
                    status: "PASS",
                    duration,
                    message: `${name} is authenticated as STUDENT.`,
                  }
                : test
            )
          );

          continue;
        }

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}${
              response.status === 401
                ? " — login required"
                : response.status === 403
                  ? " — access denied"
                  : ""
            }`
          );
        }

        if (endpoint.id === "profile") {
          const object =
            data && typeof data === "object"
              ? (data as Record<string, unknown>)
              : {};

          const profile =
            object.student ??
            object.user ??
            object.profile ??
            object;

          const profileObject =
            profile && typeof profile === "object"
              ? (profile as Record<string, unknown>)
              : {};

          const name =
            typeof profileObject.name === "string"
              ? profileObject.name
              : "Student profile";

          setTests((current) =>
            current.map((test) =>
              test.id === endpoint.id
                ? {
                    ...test,
                    status: "PASS",
                    duration,
                    message: `Profile loaded successfully — ${name}.`,
                  }
                : test
            )
          );

          continue;
        }

        const array = extractArray(data, endpoint.arrayKeys);

        const explicitCount = extractCount(
          data,
          endpoint.countKeys
        );

        const count =
          explicitCount !== undefined
            ? explicitCount
            : array.length;

        if (endpoint.id === "dashboard") {
          const object =
            data && typeof data === "object"
              ? (data as Record<string, unknown>)
              : {};

          const summary =
            object.summary &&
            typeof object.summary === "object"
              ? (object.summary as Record<string, unknown>)
              : null;

          const attendance =
            summary &&
            typeof summary.attendancePercentage === "number"
              ? summary.attendancePercentage
              : undefined;

          setTests((current) =>
            current.map((test) =>
              test.id === endpoint.id
                ? {
                    ...test,
                    status: "PASS",
                    duration,
                    message:
                      attendance !== undefined
                        ? `Dashboard connected successfully • Attendance ${attendance}%.`
                        : "Dashboard API responded successfully.",
                  }
                : test
            )
          );

          continue;
        }

        if (count > 0) {
          setTests((current) =>
            current.map((test) =>
              test.id === endpoint.id
                ? {
                    ...test,
                    status: "PASS",
                    count,
                    duration,
                    message: `${count} record(s) loaded successfully.`,
                  }
                : test
            )
          );
        } else {
          setTests((current) =>
            current.map((test) =>
              test.id === endpoint.id
                ? {
                    ...test,
                    status: "FAIL",
                    count: 0,
                    duration,
                    message:
                      "API responded successfully, but no records were returned.",
                  }
                : test
            )
          );
        }
      } catch (error) {
        const duration = Math.round(performance.now() - started);

        const message =
          error instanceof Error
            ? error.message
            : "Unknown runtime error";

        setTests((current) =>
          current.map((test) =>
            test.id === endpoint.id
              ? {
                  ...test,
                  status: "FAIL",
                  duration,
                  message,
                }
              : test
          )
        );
      }
    }

    setRunning(false);
  }, []);

  useEffect(() => {
    runTests();
  }, [runTests]);

  const passed = tests.filter(
    (test) => test.status === "PASS"
  ).length;

  const failed = tests.filter(
    (test) => test.status === "FAIL"
  ).length;

  const checking = tests.filter(
    (test) => test.status === "CHECKING"
  ).length;

  const completed = passed + failed;

  const percentage =
    completed > 0
      ? Math.round((passed / completed) * 100)
      : 0;

  const allPassed =
    completed === tests.length &&
    failed === 0;

  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#112746] via-[#0b1728] to-[#060d18] p-6 shadow-2xl sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-300">
                <ShieldCheck className="h-5 w-5" />
                CAMPUSMIND AI • STUDENT QA CENTER
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Student End-to-End Test
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Live browser-session verification of every major student
                feature and its backend API.
              </p>

              {student && (
                <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={runTests}
              disabled={running}
              className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-400/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  running ? "animate-spin" : ""
                }`}
              />
              {running ? "Running Tests..." : "Run All Tests"}
            </button>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Summary
            icon={<Activity className="h-5 w-5" />}
            title="Overall"
            value={`${percentage}%`}
            text={
              allPassed
                ? "Everything passed"
                : checking > 0
                  ? "Tests running"
                  : "Fix required"
            }
          />

          <Summary
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Passed"
            value={String(passed)}
            text="Working features"
          />

          <Summary
            icon={<XCircle className="h-5 w-5" />}
            title="Failed"
            value={String(failed)}
            text="Needs attention"
          />

          <Summary
            icon={<Clock3 className="h-5 w-5" />}
            title="Checking"
            value={String(checking)}
            text="Currently running"
          />

          <Summary
            icon={<GraduationCap className="h-5 w-5" />}
            title="Student"
            value={student?.role ?? "—"}
            text={
              startedAt
                ? `Started ${startedAt}`
                : "Waiting for test"
            }
          />
        </section>

        {/* STATUS */}
        {!running && allPassed && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-black">
                Student E2E verification completed successfully.
              </p>
              <p className="mt-1 text-sm text-emerald-200/70">
                Login, dashboard and all student data APIs are responding
                correctly.
              </p>
            </div>
          </div>
        )}

        {!running && failed > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-red-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-black">
                {failed} student feature(s) need attention.
              </p>
              <p className="mt-1 text-sm text-red-200/70">
                Check the failed rows below. We will fix only the failing
                feature.
              </p>
            </div>
          </div>
        )}

        {/* TEST TABLE */}
        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-2xl">
          <div className="border-b border-white/10 px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-cyan-300" />
              <div>
                <h2 className="font-black">
                  Student Feature Verification
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Real API requests using the current student session.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {tests.map((test, index) => (
              <TestRow
                key={test.id}
                index={index + 1}
                test={test}
              />
            ))}
          </div>
        </section>

        {/* NEXT ACTIONS */}
        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-black">
            Student E2E Checklist
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              "Login session is valid",
              "Dashboard data loads",
              "Attendance percentage is calculated",
              "Assignments are returned",
              "Exams are returned",
              "Notes are returned",
              "Timetable is returned",
              "Notifications are returned",
              "Profile is returned",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-slate-300"
              >
                <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-600">
          CampusMind AI • Student Runtime QA • Production-style verification
        </p>
      </div>
    </main>
  );
}

function Summary({
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

function TestRow({
  index,
  test,
}: {
  index: number;
  test: TestItem;
}) {
  const isPass = test.status === "PASS";
  const isFail = test.status === "FAIL";
  const isChecking = test.status === "CHECKING";

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
                {test.name}
              </h3>

              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-500">
                {test.endpoint}
              </span>
            </div>

            <p
              className={`mt-2 text-sm ${
                isFail
                  ? "text-red-300"
                  : isPass
                    ? "text-slate-400"
                    : "text-slate-500"
              }`}
            >
              {test.message}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {typeof test.count === "number" && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">
              {test.count} records
            </span>
          )}

          {typeof test.duration === "number" && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-500">
              {test.duration}ms
            </span>
          )}

          <span
            className={`inline-flex min-w-[82px] items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${
              isPass
                ? "bg-emerald-400/10 text-emerald-300"
                : isFail
                  ? "bg-red-400/10 text-red-300"
                  : "bg-cyan-400/10 text-cyan-300"
            }`}
          >
            {isPass ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : isFail ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            )}

            {test.status}
          </span>
        </div>
      </div>
    </div>
  );
}
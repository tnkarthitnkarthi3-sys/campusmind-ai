"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Megaphone,
  RefreshCw,
  Send,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Layers3,
  Link as LinkIcon,
  AlertCircle,
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

type Audience = "STUDENTS" | "FACULTY";

const notificationTypes = [
  "ACADEMIC",
  "ANNOUNCEMENT",
  "ASSIGNMENT",
  "EXAM",
  "TIMETABLE",
  "ATTENDANCE",
  "GENERAL",
];

export default function AdminNotificationsPage() {
  const [audience, setAudience] = useState<Audience>("STUDENTS");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ACADEMIC");
  const [link, setLink] = useState("");

  const [loadingFilters, setLoadingFilters] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageState, setMessageState] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const selectedDepartment = useMemo(
    () => departments.find((item) => item.id === departmentId),
    [departments, departmentId]
  );

  const selectedCourse = useMemo(
    () => courses.find((item) => item.id === courseId),
    [courses, courseId]
  );

  const selectedSemester = useMemo(
    () => semesters.find((item) => item.id === semesterId),
    [semesters, semesterId]
  );

  const filteredCourses = useMemo(() => {
    if (!departmentId) return [];
    return courses.filter(
      (course) => course.departmentId === departmentId
    );
  }, [courses, departmentId]);

  const filteredSemesters = useMemo(() => {
    if (!courseId) return [];
    return semesters
      .filter((semester) => semester.courseId === courseId)
      .sort((a, b) => a.number - b.number);
  }, [semesters, courseId]);

  async function loadFilters() {
    try {
      setLoadingFilters(true);
      setMessageState(null);

      const [departmentResponse, courseResponse, semesterResponse] =
        await Promise.all([
          fetch("/api/departments", { cache: "no-store" }),
          fetch("/api/courses", { cache: "no-store" }),
          fetch("/api/semesters", { cache: "no-store" }),
        ]);

      if (
        !departmentResponse.ok ||
        !courseResponse.ok ||
        !semesterResponse.ok
      ) {
        throw new Error("Unable to load academic filters");
      }

      const departmentData = await departmentResponse.json();
      const courseData = await courseResponse.json();
      const semesterData = await semesterResponse.json();

      setDepartments(departmentData.departments ?? []);
      setCourses(courseData.courses ?? []);
      setSemesters(semesterData.semesters ?? []);
    } catch (error) {
      console.error(error);

      setMessageState({
        type: "error",
        text: "Unable to load academic filters.",
      });
    } finally {
      setLoadingFilters(false);
    }
  }

  useEffect(() => {
    loadFilters();
  }, []);

  function changeAudience(value: Audience) {
    setAudience(value);
    setDepartmentId("");
    setCourseId("");
    setSemesterId("");
    setMessageState(null);
  }

  function changeDepartment(value: string) {
    setDepartmentId(value);
    setCourseId("");
    setSemesterId("");
    setMessageState(null);
  }

  function changeCourse(value: string) {
    setCourseId(value);
    setSemesterId("");
    setMessageState(null);
  }

  function resetForm() {
    setDepartmentId("");
    setCourseId("");
    setSemesterId("");
    setTitle("");
    setMessage("");
    setType("ACADEMIC");
    setLink("");
    setMessageState(null);
  }

  async function sendNotification() {
    setMessageState(null);

    if (!title.trim()) {
      setMessageState({
        type: "error",
        text: "Notification title is required.",
      });
      return;
    }

    if (!message.trim()) {
      setMessageState({
        type: "error",
        text: "Notification message is required.",
      });
      return;
    }

    if (audience === "FACULTY" && !departmentId) {
      setMessageState({
        type: "error",
        text: "Select a department for faculty notifications.",
      });
      return;
    }

    if (
      audience === "STUDENTS" &&
      !departmentId &&
      !courseId &&
      !semesterId
    ) {
      const confirmed = window.confirm(
        "This will notify all students. Continue?"
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setSending(true);

      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audience,
          departmentId: departmentId || undefined,
          courseId: courseId || undefined,
          semesterId: semesterId || undefined,
          title: title.trim(),
          message: message.trim(),
          type,
          link: link.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to send notification."
        );
      }

      const count =
        typeof data.count === "number"
          ? data.count
          : data.result?.count ?? 0;

      setMessageState({
        type: "success",
        text:
          count > 0
            ? `Notification sent successfully to ${count} user${
                count === 1 ? "" : "s"
              }.`
            : "Notification processed, but no matching users were found.",
      });

      setTitle("");
      setMessage("");
      setLink("");
    } catch (error) {
      console.error(error);

      setMessageState({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to send notification.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-400">
              <Bell className="h-4 w-4" />
              Communication Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Notification Center
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Send official academic and institutional notifications to
              students or faculty using department, course and semester
              targeting.
            </p>
          </div>

          <button
            type="button"
            onClick={loadFilters}
            disabled={loadingFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loadingFilters ? "animate-spin" : ""
              }`}
            />
            Refresh Academic Data
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
              <Building2 className="h-5 w-5 text-cyan-400" />
            </div>

            <p className="text-sm text-slate-400">Departments</p>
            <p className="mt-1 text-2xl font-bold">
              {departments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10">
              <BookOpen className="h-5 w-5 text-violet-400" />
            </div>

            <p className="text-sm text-slate-400">Courses</p>
            <p className="mt-1 text-2xl font-bold">
              {courses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
              <Layers3 className="h-5 w-5 text-emerald-400" />
            </div>

            <p className="text-sm text-slate-400">Semesters</p>
            <p className="mt-1 text-2xl font-bold">
              {semesters.length}
            </p>
          </div>
        </div>

        {/* Main */}
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* Form */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                  <Megaphone className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Create Notification
                  </h2>
                  <p className="text-sm text-slate-500">
                    Choose the target audience and academic scope.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Audience */}
              <div>
                <label className="mb-3 block text-sm font-medium text-slate-300">
                  Target Audience
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => changeAudience("STUDENTS")}
                    className={`rounded-xl border p-4 text-left transition ${
                      audience === "STUDENTS"
                        ? "border-cyan-400/50 bg-cyan-400/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <GraduationCap
                      className={`mb-2 h-5 w-5 ${
                        audience === "STUDENTS"
                          ? "text-cyan-400"
                          : "text-slate-400"
                      }`}
                    />

                    <div className="font-medium">Students</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Academic student notifications
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => changeAudience("FACULTY")}
                    className={`rounded-xl border p-4 text-left transition ${
                      audience === "FACULTY"
                        ? "border-violet-400/50 bg-violet-400/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <Users
                      className={`mb-2 h-5 w-5 ${
                        audience === "FACULTY"
                          ? "text-violet-400"
                          : "text-slate-400"
                      }`}
                    />

                    <div className="font-medium">Faculty</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Department faculty notifications
                    </div>
                  </button>
                </div>
              </div>

              {/* Academic targeting */}
              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    Academic Targeting
                  </span>

                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Optional
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* Department */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      Department
                    </label>

                    <select
                      value={departmentId}
                      onChange={(event) =>
                        changeDepartment(event.target.value)
                      }
                      disabled={loadingFilters}
                      className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:opacity-50"
                    >
                      <option value="">All Departments</option>

                      {departments.map((department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.code} — {department.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      Course
                    </label>

                    <select
                      value={courseId}
                      onChange={(event) =>
                        changeCourse(event.target.value)
                      }
                      disabled={
                        loadingFilters || !departmentId
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <option value="">
                        {departmentId
                          ? "All Courses"
                          : "Select department first"}
                      </option>

                      {filteredCourses.map((course) => (
                        <option
                          key={course.id}
                          value={course.id}
                        >
                          {course.code} — {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      Semester
                    </label>

                    <select
                      value={semesterId}
                      onChange={(event) =>
                        setSemesterId(event.target.value)
                      }
                      disabled={
                        loadingFilters || !courseId
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <option value="">
                        {courseId
                          ? "All Semesters"
                          : "Select course first"}
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
                  </div>
                </div>
              </div>

              {/* Notification */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Notification Title
                    </label>

                    <input
                      value={title}
                      onChange={(event) =>
                        setTitle(event.target.value)
                      }
                      maxLength={160}
                      placeholder="Example: Internal Examination Schedule"
                      className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Type
                    </label>

                    <select
                      value={type}
                      onChange={(event) =>
                        setType(event.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    >
                      {notificationTypes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Message
                  </label>

                  <textarea
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    maxLength={2000}
                    rows={6}
                    placeholder="Write the official notification message..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50"
                  />

                  <div className="mt-1 text-right text-xs text-slate-600">
                    {message.length}/2000
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <LinkIcon className="h-4 w-4" />
                    Optional Link
                  </label>

                  <input
                    value={link}
                    onChange={(event) =>
                      setLink(event.target.value)
                    }
                    placeholder="/student-exams"
                    className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50"
                  />
                </div>
              </div>

              {/* Status */}
              {messageState && (
                <div
                  className={`flex items-start gap-3 rounded-xl border p-4 ${
                    messageState.type === "success"
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                      : "border-red-400/20 bg-red-400/10 text-red-300"
                  }`}
                >
                  {messageState.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  )}

                  <span className="text-sm leading-5">
                    {messageState.text}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={sending}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={sendNotification}
                  disabled={sending || loadingFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Preview */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  <Bell className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Notification Preview
                  </h2>
                  <p className="text-xs text-slate-500">
                    How recipients will see the message.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b1728] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                    <Bell className="h-5 w-5 text-cyan-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {title || "Notification title"}
                      </p>

                      <span className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-slate-500">
                        {type}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-400">
                      {message ||
                        "Your notification message will appear here."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <h2 className="mb-4 font-semibold">
                Delivery Scope
              </h2>

              <div className="space-y-3">
                <ScopeRow
                  label="Audience"
                  value={
                    audience === "STUDENTS"
                      ? "Students"
                      : "Faculty"
                  }
                />

                <ScopeRow
                  label="Department"
                  value={
                    selectedDepartment?.code ??
                    "All departments"
                  }
                />

                <ScopeRow
                  label="Course"
                  value={
                    selectedCourse?.code ??
                    "All courses"
                  }
                />

                <ScopeRow
                  label="Semester"
                  value={
                    selectedSemester?.name ??
                    "All semesters"
                  }
                />
              </div>

              {audience === "STUDENTS" &&
                !departmentId &&
                !courseId &&
                !semesterId && (
                  <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
                    <p className="text-xs leading-5 text-amber-300">
                      No academic filters are selected. This
                      notification will target all students.
                    </p>
                  </div>
                )}

              {audience === "FACULTY" &&
                !departmentId && (
                  <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
                    <p className="text-xs leading-5 text-amber-300">
                      Select a department before sending a
                      faculty notification.
                    </p>
                  </div>
                )}
            </section>

            <section className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Academic Targeting
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Department filters courses, and course
                    selection filters semesters automatically.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ScopeRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/10 px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-slate-600">
        {label}
      </span>

      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium text-slate-300">
          {value}
        </span>

        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-700" />
      </div>
    </div>
  );
}
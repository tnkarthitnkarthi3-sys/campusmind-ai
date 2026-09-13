"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Building2,
  BookOpen,
  UserRound,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Subject = {
  id: string;
  name: string;
  code: string;
};

type Department = {
  id: string;
  name: string;
  code: string;
};

type Faculty = {
  id: string;
  name: string;
  email: string;
  department: Department | null;
  subjects: Subject[];
};

export default function FacultyDirectoryPage() {
  const [faculty, setFaculty] =
    useState<Faculty[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [search, setSearch] =
    useState("");

  const [departmentId, setDepartmentId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [expanded, setExpanded] =
    useState<string | null>(null);

  async function loadFaculty(
    searchValue = search,
    selectedDepartment = departmentId
  ) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.set(
          "q",
          searchValue.trim()
        );
      }

      if (selectedDepartment) {
        params.set(
          "departmentId",
          selectedDepartment
        );
      }

      const response = await fetch(
        `/api/faculty-directory?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Failed to load faculty"
        );
      }

      setFaculty(data.faculty || []);
      setDepartments(
        data.departments || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load faculty information"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaculty("", "");
  }, []);

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    loadFaculty(
      search,
      departmentId
    );
  }

  function handleDepartmentChange(
    value: string
  ) {
    setDepartmentId(value);

    loadFaculty(
      search,
      value
    );
  }

  function clearFilters() {
    setSearch("");
    setDepartmentId("");

    loadFaculty("", "");
  }

  const subjectCount = useMemo(() => {
    const subjects = new Set<string>();

    faculty.forEach((member) => {
      member.subjects.forEach(
        (subject) => {
          subjects.add(subject.id);
        }
      );
    });

    return subjects.size;
  }, [faculty]);

  const departmentCount = useMemo(() => {
    const departmentsSet =
      new Set<string>();

    faculty.forEach((member) => {
      if (member.department?.id) {
        departmentsSet.add(
          member.department.id
        );
      }
    });

    return departmentsSet.size;
  }, [faculty]);

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <div className="mb-2 flex items-center gap-2 text-violet-600">
              <Users size={20} />

              <span className="font-bold">
                Campus Directory
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-950 md:text-4xl">
              Faculty Information
            </h1>

            <p className="mt-2 text-slate-500">
              Find faculty members, departments
              and subjects.
            </p>
          </div>

          <button
            onClick={() =>
              loadFaculty(
                search,
                departmentId
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* SEARCH / FILTER */}
        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <form
            onSubmit={handleSearch}
            className="grid gap-3 md:grid-cols-[1fr_280px_auto_auto]"
          >

            <div className="relative">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search faculty name or email..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              />

            </div>

            <select
              value={departmentId}
              onChange={(event) =>
                handleDepartmentChange(
                  event.target.value
                )
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            >
              <option value="">
                All Departments
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.code} —{" "}
                    {department.name}
                  </option>
                )
              )}
            </select>

            <button
              type="submit"
              className="rounded-2xl bg-violet-600 px-7 py-4 text-sm font-black text-white transition hover:bg-violet-700"
            >
              Search
            </button>

            {(search ||
              departmentId) && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            )}

          </form>

        </section>

        {/* STATS */}
        <div className="mb-7 grid gap-4 sm:grid-cols-3">

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Users size={24} />
              </div>

              <span className="text-3xl font-black text-slate-950">
                {faculty.length}
              </span>

            </div>

            <p className="mt-4 text-sm font-bold text-slate-900">
              Faculty Members
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Faculty matching your search
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <Building2 size={24} />
              </div>

              <span className="text-3xl font-black text-slate-950">
                {departmentCount}
              </span>

            </div>

            <p className="mt-4 text-sm font-bold text-slate-900">
              Departments
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Departments represented
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BookOpen size={24} />
              </div>

              <span className="text-3xl font-black text-slate-950">
                {subjectCount}
              </span>

            </div>

            <p className="mt-4 text-sm font-bold text-slate-900">
              Subjects
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Subjects handled by faculty
            </p>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* FACULTY */}
        <section>

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Faculty Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Faculty members and their academic
                subjects.
              </p>
            </div>

            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">
              {faculty.length} found
            </span>

          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

              <RefreshCw
                className="mx-auto mb-4 animate-spin text-violet-600"
                size={34}
              />

              <p className="font-bold text-slate-700">
                Loading faculty directory...
              </p>

            </div>
          ) : faculty.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">

              <UserRound
                className="mx-auto mb-4 text-slate-400"
                size={42}
              />

              <h3 className="text-xl font-black text-slate-950">
                No faculty found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another faculty name,
                email or department.
              </p>

            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {faculty.map((member) => {
                const isExpanded =
                  expanded === member.id;

                return (
                  <article
                    key={member.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >

                    {/* FACULTY HEADER */}
                    <button
                      onClick={() =>
                        setExpanded(
                          isExpanded
                            ? null
                            : member.id
                        )
                      }
                      className="w-full p-5 text-left md:p-6"
                    >

                      <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-lg font-black text-white shadow-sm">
                          {member.name
                            .split(" ")
                            .map(
                              (part) =>
                                part[0]
                            )
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <div>
                              <h3 className="text-lg font-black text-slate-950">
                                {member.name}
                              </h3>

                              <div className="mt-2 flex flex-wrap gap-2">

                                {member.department && (
                                  <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black text-violet-700">
                                    {
                                      member
                                        .department
                                        .code
                                    }
                                  </span>
                                )}

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
                                  {
                                    member
                                      .subjects
                                      .length
                                  }{" "}
                                  subject
                                  {member
                                    .subjects
                                    .length !==
                                  1
                                    ? "s"
                                    : ""}
                                </span>

                              </div>
                            </div>

                            {isExpanded ? (
                              <ChevronUp
                                size={20}
                                className="shrink-0 text-slate-400"
                              />
                            ) : (
                              <ChevronDown
                                size={20}
                                className="shrink-0 text-slate-400"
                              />
                            )}

                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                            <Mail
                              size={16}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="truncate">
                              {member.email}
                            </span>
                          </div>

                        </div>

                      </div>

                    </button>

                    {/* EXPANDED INFO */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 p-5 md:p-6">

                        {member.department && (
                          <div className="mb-4 rounded-2xl bg-white p-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                                <Building2
                                  size={19}
                                />
                              </div>

                              <div>
                                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                                  Department
                                </p>

                                <p className="mt-1 text-sm font-black text-slate-900">
                                  {
                                    member
                                      .department
                                      .name
                                  }
                                </p>

                              </div>

                            </div>

                          </div>
                        )}

                        <div className="rounded-2xl bg-white p-4">

                          <div className="mb-4 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <GraduationCap
                                size={19}
                              />
                            </div>

                            <div>
                              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                                Teaching Subjects
                              </p>

                              <p className="mt-1 text-sm font-black text-slate-900">
                                {
                                  member
                                    .subjects
                                    .length
                                }{" "}
                                subject
                                {member
                                  .subjects
                                  .length !==
                                1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>

                          </div>

                          {member.subjects.length ===
                          0 ? (
                            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                              No subjects are
                              assigned yet.
                            </p>
                          ) : (
                            <div className="grid gap-2 sm:grid-cols-2">

                              {member.subjects.map(
                                (subject) => (
                                  <div
                                    key={
                                      subject.id
                                    }
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                                  >

                                    <p className="text-sm font-black text-slate-900">
                                      {
                                        subject.name
                                      }
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-violet-600">
                                      {
                                        subject.code
                                      }
                                    </p>

                                  </div>
                                )
                              )}

                            </div>
                          )}

                        </div>

                        <a
                          href={`mailto:${member.email}`}
                          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                        >
                          <Mail size={17} />
                          Contact Faculty
                        </a>

                      </div>
                    )}

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

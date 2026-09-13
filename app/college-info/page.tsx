"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Search,
  RefreshCw,
  GraduationCap,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Globe2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Course = {
  id: string;
  name: string;
  code: string;
  durationYears: number;
};

type Department = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  courses: Course[];
};

type College = {
  id: string;
  name: string;
  shortName?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoUrl?: string | null;
};

export default function CollegeInfoPage() {
  const [college, setCollege] =
    useState<College | null>(null);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [expanded, setExpanded] =
    useState<string | null>(null);

  async function loadCollegeInfo(
    searchValue = ""
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

      const response = await fetch(
        `/api/college-info?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Failed to load college information"
        );
      }

      setCollege(data.college || null);
      setDepartments(
        data.departments || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load college information"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCollegeInfo();
  }, []);

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    loadCollegeInfo(search);
  }

  function clearSearch() {
    setSearch("");
    loadCollegeInfo("");
  }

  const totalCourses = useMemo(() => {
    return departments.reduce(
      (total, department) =>
        total + department.courses.length,
      0
    );
  }, [departments]);

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <div className="mb-2 flex items-center gap-2 text-cyan-600">
              <Building2 size={20} />

              <span className="font-bold">
                Campus Information
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-950 md:text-4xl">
              College Information
            </h1>

            <p className="mt-2 text-slate-500">
              Search departments, courses and
              important college information.
            </p>
          </div>

          <button
            onClick={() =>
              loadCollegeInfo(search)
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

        {/* COLLEGE CARD */}
        {college && (
          <section className="mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-6 text-white md:p-8">

              <div className="flex flex-col gap-6 md:flex-row md:items-center">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 backdrop-blur">
                  {college.logoUrl ? (
                    <img
                      src={college.logoUrl}
                      alt={college.name}
                      className="h-full w-full rounded-3xl object-cover"
                    />
                  ) : (
                    <Building2 size={38} />
                  )}
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-2xl font-black md:text-3xl">
                      {college.name}
                    </h2>

                    {college.shortName && (
                      <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-200">
                        {college.shortName}
                      </span>
                    )}

                  </div>

                  {college.description && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                      {college.description}
                    </p>
                  )}

                </div>

              </div>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4">

              {college.address && (
                <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-cyan-600"
                  />

                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Address
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {college.address}
                    </p>
                  </div>
                </div>
              )}

              {college.phone && (
                <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                  <Phone
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {college.phone}
                    </p>
                  </div>
                </div>
              )}

              {college.email && (
                <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                  <Mail
                    size={19}
                    className="mt-0.5 shrink-0 text-violet-600"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                      {college.email}
                    </p>
                  </div>
                </div>
              )}

              {college.website && (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-cyan-50"
                >
                  <Globe2
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Website
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-blue-600">
                      Visit college website
                    </p>
                  </div>
                </a>
              )}

            </div>
          </section>
        )}

        {/* SEARCH */}
        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 md:flex-row"
          >

            <div className="relative flex-1">

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
                placeholder="Search department, code or description..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
              />

            </div>

            <button
              type="submit"
              className="rounded-2xl bg-cyan-600 px-7 py-4 text-sm font-black text-white transition hover:bg-cyan-700"
            >
              Search
            </button>

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            )}

          </form>

        </section>

        {/* STATS */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <GraduationCap size={24} />
              </div>

              <span className="text-3xl font-black text-slate-950">
                {departments.length}
              </span>

            </div>

            <p className="mt-4 text-sm font-bold text-slate-900">
              Departments
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Active academic departments
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <BookOpen size={24} />
              </div>

              <span className="text-3xl font-black text-slate-950">
                {totalCourses}
              </span>

            </div>

            <p className="mt-4 text-sm font-bold text-slate-900">
              Courses
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Available academic programs
            </p>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* DEPARTMENTS */}
        <section>

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Departments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Explore departments and their
                courses.
              </p>
            </div>

            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">
              {departments.length} found
            </span>

          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

              <RefreshCw
                className="mx-auto mb-4 animate-spin text-cyan-600"
                size={34}
              />

              <p className="font-bold text-slate-700">
                Loading college information...
              </p>

            </div>
          ) : departments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">

              <Search
                className="mx-auto mb-4 text-slate-400"
                size={40}
              />

              <h3 className="text-xl font-black text-slate-950">
                No departments found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another department name or
                department code.
              </p>

            </div>
          ) : (
            <div className="grid gap-4">

              {departments.map(
                (department) => {
                  const isExpanded =
                    expanded ===
                    department.id;

                  return (
                    <div
                      key={department.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                    >

                      <button
                        onClick={() =>
                          setExpanded(
                            isExpanded
                              ? null
                              : department.id
                          )
                        }
                        className="flex w-full items-center gap-4 p-5 text-left md:p-6"
                      >

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                          {department.code.slice(
                            0,
                            4
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-lg font-black text-slate-950">
                              {department.name}
                            </h3>

                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700">
                              {department.code}
                            </span>

                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {department.courses.length}{" "}
                            course
                            {department.courses.length !==
                            1
                              ? "s"
                              : ""}
                          </p>

                        </div>

                        {isExpanded ? (
                          <ChevronUp
                            className="shrink-0 text-slate-400"
                            size={21}
                          />
                        ) : (
                          <ChevronDown
                            className="shrink-0 text-slate-400"
                            size={21}
                          />
                        )}

                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50 p-5 md:p-6">

                          {department.description && (
                            <p className="mb-5 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
                              {
                                department.description
                              }
                            </p>
                          )}

                          <div className="grid gap-3 md:grid-cols-2">

                            {department.courses.map(
                              (course) => (
                                <div
                                  key={
                                    course.id
                                  }
                                  className="rounded-2xl border border-slate-200 bg-white p-4"
                                >

                                  <div className="flex items-start justify-between gap-3">

                                    <div className="flex gap-3">

                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                        <BookOpen
                                          size={
                                            19
                                          }
                                        />
                                      </div>

                                      <div>

                                        <h4 className="font-black text-slate-900">
                                          {
                                            course.name
                                          }
                                        </h4>

                                        <p className="mt-1 text-xs font-bold text-slate-400">
                                          {
                                            course.code
                                          }
                                        </p>

                                      </div>

                                    </div>

                                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                                      {
                                        course.durationYears
                                      }{" "}
                                      Years
                                    </span>

                                  </div>

                                </div>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Search,
  Users,
} from "lucide-react";

export default function FacultyStudentsPage() {
  const [students, setStudents] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function load() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/faculty/students",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load students"
        );
      }

      setStudents(data.students || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load students"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered =
    students.filter(
      (student) =>
        student.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        student.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <main className="min-h-screen bg-slate-50 p-5 lg:p-8">

      <div className="mx-auto max-w-7xl">

        <header className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-3">
              <Users className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Students
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Students available within your academic department.
              </p>
            </div>

          </div>

        </header>


        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search students..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
            />

          </div>

        </div>


        {loading && (
          <div className="mt-6 h-80 animate-pulse rounded-2xl bg-white" />
        )}


        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-white p-6">
            <p className="font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}


        {!loading &&
          !error && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Email
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Course ID
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Semester ID
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filtered.map(
                      (student) => (
                        <tr
                          key={student.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="rounded-xl bg-slate-100 p-2">
                                <Users className="h-4 w-4 text-slate-600" />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {student.name}
                                </p>

                                <p className="text-xs text-slate-400">
                                  {student.id}
                                </p>
                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-4 w-4" />
                              {student.email}
                            </div>

                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {student.courseId ||
                              "-"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {student.semesterId ||
                              "-"}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>


              {filtered.length === 0 && (
                <div className="p-10 text-center text-sm text-slate-500">
                  No students found.
                </div>
              )}

            </div>
          )}

      </div>
    </main>
  );
}
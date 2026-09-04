"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
} from "lucide-react";

export default function FacultySubjectsPage() {
  const [subjects, setSubjects] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function load() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/faculty/subjects",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load subjects"
        );
      }

      setSubjects(data.subjects || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load subjects"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-5 lg:p-8">

      <div className="mx-auto max-w-7xl">

        <header className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-3">
              <BookOpen className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                My Subjects
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Subjects officially assigned to you.
              </p>
            </div>

          </div>

        </header>


        {loading && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-2xl bg-white"
                />
              )
            )}

          </div>
        )}


        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6">
            <p className="font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}


        {!loading &&
          !error &&
          subjects.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <BookOpen className="mx-auto h-10 w-10 text-slate-400" />

              <h2 className="mt-4 font-semibold text-slate-900">
                No subjects assigned
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your assigned subjects will appear here.
              </p>

            </div>
          )}


        {!loading &&
          !error &&
          subjects.length > 0 && (
            <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {subjects.map(
                (item) => (
                  <article
                    key={item.assignmentId}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <div className="flex items-start justify-between">

                      <div className="rounded-xl bg-slate-100 p-3">
                        <BookOpen className="h-5 w-5 text-slate-700" />
                      </div>

                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {item.subject?.code}
                      </span>

                    </div>


                    <h2 className="mt-5 text-lg font-bold text-slate-900">
                      {item.subject?.name}
                    </h2>


                    <div className="mt-4 space-y-3 text-sm">

                      <div className="flex items-center gap-2 text-slate-600">
                        <GraduationCap className="h-4 w-4" />

                        {item.course?.name ||
                          "-"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {item.semester?.name ||
                          "-"}
                      </div>

                      <div className="text-xs font-semibold text-slate-500">
                        {item.subject?.credits ||
                          0}{" "}
                        Credits
                      </div>

                    </div>

                  </article>
                )
              )}

            </section>
          )}

      </div>
    </main>
  );
}
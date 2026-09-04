"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  Mail,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type Subject = {
  id: string;
  name: string;
  code: string;
  credits: number;
  course: {
    id: string;
    name: string;
    code: string;
    department: {
      id: string;
      name: string;
      code: string;
    };
  };
  semester: {
    id: string;
    name: string;
    number: number;
  };
};

type Faculty = {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
};

export default function FacultyDetailsPage() {
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [assignedSubjects, setAssignedSubjects] = useState<
    {
      id: string;
      subject: Subject;
    }[]
  >([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");

  const facultyId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop()
      : "";

  async function loadData() {
    if (!facultyId) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/faculty/${facultyId}/subjects`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load faculty"
        );
      }

      setFaculty(data.faculty);
      setAssignedSubjects(data.assignedSubjects || []);
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load faculty"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [facultyId]);

  const availableSubjects = useMemo(() => {
    const assignedIds = new Set(
      assignedSubjects.map((item) => item.subject.id)
    );

    return subjects.filter(
      (subject) => !assignedIds.has(subject.id)
    );
  }, [subjects, assignedSubjects]);

  async function assignSubject() {
    if (!selectedSubject) {
      alert("Please select a subject.");
      return;
    }

    try {
      setAssigning(true);

      const response = await fetch(
        `/api/admin/faculty/${facultyId}/subjects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subjectId: selectedSubject,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to assign subject"
        );
      }

      setModalOpen(false);
      setSelectedSubject("");

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to assign subject"
      );
    } finally {
      setAssigning(false);
    }
  }

  async function removeSubject(subjectId: string) {
    const confirmed = window.confirm(
      "Remove this subject from the faculty?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/faculty/${facultyId}/subjects`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subjectId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to remove subject"
        );
      }

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to remove subject"
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading faculty profile...
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-red-100 bg-white p-12 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Faculty not found
          </h1>

          <Link
            href="/admin/faculty"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={17} />
            Back to Faculty
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <Link
          href="/admin/faculty"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to Faculty
        </Link>

        <section className="rounded-3xl bg-slate-950 p-7 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                <UserRound size={30} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {faculty.name}
                  </h1>

                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <Mail size={15} />
                    {faculty.email}
                  </span>

                  <span className="flex items-center gap-2">
                    <GraduationCap size={15} />
                    Faculty
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus size={18} />
              Assign Subject
            </button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Building2
              size={21}
              className="text-indigo-600"
            />

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Department
            </p>

            <p className="mt-2 font-bold text-slate-900">
              {subjects[0]?.course?.department?.name ||
                "Department"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen
              size={21}
              className="text-violet-600"
            />

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Assigned Subjects
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {assignedSubjects.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2
              size={21}
              className="text-emerald-600"
            />

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Assignment Status
            </p>

            <p className="mt-2 font-bold text-emerald-700">
              Academic Mapping Ready
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Assigned Subjects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Subjects currently assigned to this faculty member.
            </p>
          </div>

          {assignedSubjects.length === 0 ? (
            <div className="p-14 text-center">
              <BookOpen
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-900">
                No subjects assigned
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Assign subjects from this faculty profile.
              </p>

              <button
                onClick={() => setModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Assign First Subject
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {assignedSubjects.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                      <BookOpen size={20} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        {item.subject.name}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                          {item.subject.code}
                        </span>

                        <span className="rounded-md bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">
                          {item.subject.course.code}
                        </span>

                        <span className="rounded-md bg-violet-50 px-2 py-1 font-semibold text-violet-700">
                          Semester {item.subject.semester.number}
                        </span>

                        <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                          {item.subject.credits} Credits
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeSubject(item.subject.id)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Assign Subject
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Only active subjects from the faculty department are shown.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {availableSubjects.length === 0 ? (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-800">
                  No available subjects found for this faculty.
                </div>
              ) : (
                <select
                  value={selectedSubject}
                  onChange={(e) =>
                    setSelectedSubject(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">
                    Select a subject
                  </option>

                  {availableSubjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.code} — {subject.name} —{" "}
                      {subject.course.code} — Sem{" "}
                      {subject.semester.number}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                disabled={
                  assigning ||
                  !selectedSubject ||
                  availableSubjects.length === 0
                }
                onClick={assignSubject}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning
                  ? "Assigning..."
                  : "Assign Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarDays,
  Pencil,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  department?: {
    name: string;
    code: string;
  } | null;
  course?: {
    name: string;
    code: string;
  } | null;
  semester?: {
    name: string;
    number: number;
  } | null;
};

export default function ProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/profile", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load profile");
      }

      setStudent(data.student);
      setName(data.student.name || "");
      setPhone(data.student.phone || "");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load profile",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function saveProfile() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update profile");
      }

      setStudent(data.student);
      setName(data.student.name || "");
      setPhone(data.student.phone || "");

      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update profile",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </main>
    );
  }

  if (!student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Unable to load student profile.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">

        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15">
              <User className="h-10 w-10" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-blue-100">
                Student Profile
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                {student.name}
              </h1>

              <p className="mt-1 text-sm text-blue-100">
                {student.email}
              </p>
            </div>

            {!editing && (
              <button
                onClick={() => {
                  setEditing(true);
                  setSuccess("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Personal Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your basic contact information.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <ProfileField
              icon={<User className="h-5 w-5" />}
              label="Full Name"
              value={name}
              editable={editing}
              onChange={setName}
            />

            <ProfileField
              icon={<Mail className="h-5 w-5" />}
              label="Email Address"
              value={student.email}
              editable={false}
            />

            <ProfileField
              icon={<Phone className="h-5 w-5" />}
              label="Phone Number"
              value={phone}
              editable={editing}
              onChange={setPhone}
              placeholder="Enter phone number"
            />

            <InfoField
              icon={<GraduationCap className="h-5 w-5" />}
              label="Role"
              value="Student"
            />

          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Academic Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Academic details assigned by the college administration.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <AcademicCard
              icon={<Building2 className="h-5 w-5" />}
              label="Department"
              value={
                student.department
                  ? `${student.department.name} (${student.department.code})`
                  : "Not assigned"
              }
            />

            <AcademicCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Course"
              value={
                student.course
                  ? `${student.course.name} (${student.course.code})`
                  : "Not assigned"
              }
            />

            <AcademicCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="Semester"
              value={
                student.semester
                  ? student.semester.name
                  : "Not assigned"
              }
            />

          </div>
        </section>

        {editing && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => {
                setEditing(false);
                setName(student.name);
                setPhone(student.phone || "");
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={saveProfile}
              disabled={saving || !name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              Save Changes
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

function ProfileField({
  icon,
  label,
  value,
  editable,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editable: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          value={value}
          disabled={!editable}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>
    </div>
  );
}

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
        {icon}
        {value}
      </div>
    </div>
  );
}

function AcademicCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 inline-flex rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
        {icon}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Edit3,
  Plus,
  Search,
  Trash2,
  Users,
  BookOpen,
  X,
  CheckCircle2,
  Power,
} from "lucide-react";

type Department = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
  _count: {
    users: number;
    courses: number;
  };
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  async function loadDepartments() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/departments", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load departments");
      }

      setDepartments(data.departments || []);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setCode("");
    setDescription("");
    setActive(true);
    setModal(true);
  }

  function openEdit(department: Department) {
    setEditing(department);
    setName(department.name);
    setCode(department.code);
    setDescription(department.description || "");
    setActive(department.active);
    setModal(true);
  }

  async function saveDepartment() {
    if (!name.trim() || !code.trim()) {
      alert("Department name and code are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/departments", {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editing?.id,
          name,
          code,
          description,
          active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save department");
      }

      setModal(false);
      await loadDepartments();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDepartment(id: string) {
    const confirmed = confirm(
      "Delete this department? Related courses will also be affected."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/departments?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete");
      }

      await loadDepartments();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete");
    }
  }

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return departments;

    return departments.filter(
      (department) =>
        department.name.toLowerCase().includes(query) ||
        department.code.toLowerCase().includes(query)
    );
  }, [departments, search]);

  const activeCount = departments.filter((d) => d.active).length;
  const totalStudents = departments.reduce(
    (sum, d) => sum + d._count.users,
    0
  );
  const totalCourses = departments.reduce(
    (sum, d) => sum + d._count.courses,
    0
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="mx-auto max-w-[1500px] p-6 lg:p-8">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Building2 size={17} />
              Academic Structure
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Departments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage college departments and their academic structure.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>

        <div className="mb-7 grid gap-4 md:grid-cols-4">
          <Stat
            label="Total Departments"
            value={departments.length}
            icon={<Building2 size={20} />}
          />

          <Stat
            label="Active"
            value={activeCount}
            icon={<CheckCircle2 size={20} />}
          />

          <Stat
            label="Students"
            value={totalStudents}
            icon={<Users size={20} />}
          />

          <Stat
            label="Courses"
            value={totalCourses}
            icon={<BookOpen size={20} />}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">Department Directory</h2>
              <p className="mt-1 text-xs text-slate-500">
                Create, update and manage institutional departments.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search departments..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading departments...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center">
              <Building2 className="mx-auto mb-4 text-slate-300" size={40} />
              <h3 className="font-semibold">No departments found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Add your first academic department.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add Department
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Courses</th>
                    <th className="px-6 py-4">Students</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((department) => (
                    <tr
                      key={department.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Building2 size={19} />
                          </div>

                          <div>
                            <div className="font-semibold">
                              {department.name}
                            </div>

                            {department.description && (
                              <div className="mt-0.5 max-w-[350px] truncate text-xs text-slate-500">
                                {department.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                          {department.code}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm font-medium">
                        {department._count.courses}
                      </td>

                      <td className="px-6 py-5 text-sm font-medium">
                        {department._count.users}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            department.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Power size={12} />
                          {department.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(department)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => deleteDepartment(department.id)}
                            className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold">
                  {editing ? "Edit Department" : "Create Department"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the official academic department details.
                </p>
              </div>

              <button
                onClick={() => setModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <Field label="Department Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Computer Science and Engineering"
                  className="input"
                />
              </Field>

              <Field label="Department Code">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CSE"
                  className="input"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Department description..."
                  className="input resize-none"
                />
              </Field>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <div className="text-sm font-semibold">Active Department</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Allow this department to be used in academic records.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  onClick={saveDepartment}
                  className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Create Department"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
        }

        .input:focus {
          border-color: #3b82f6;
          background: white;
        }
      `}</style>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

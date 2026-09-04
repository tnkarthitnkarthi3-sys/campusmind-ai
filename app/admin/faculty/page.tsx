"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  BookOpen,
  Building2,
  Mail,
  X,
  ArrowRight,
} from "lucide-react";

type Faculty = {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  _count: {
    facultySubjects: number;
  };
};

type Department = {
  id: string;
  name: string;
  code: string;
};

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
    active: true,
  });

  async function loadFaculty() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/faculty",
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

      setFaculty(data.faculty || []);
      setDepartments(data.departments || []);
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
    loadFaculty();
  }, []);

  function openCreate() {
    setEditingId(null);

    setForm({
      name: "",
      email: "",
      password: "",
      departmentId: "",
      active: true,
    });

    setModalOpen(true);
  }

  function openEdit(item: Faculty) {
    setEditingId(item.id);

    setForm({
      name: item.name,
      email: item.email,
      password: "",
      departmentId: item.departmentId || "",
      active: true,
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
  }

  async function saveFaculty() {
    if (!form.name.trim()) {
      alert("Faculty name is required.");
      return;
    }

    if (!form.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (!editingId && form.password.length < 8) {
      alert(
        "Password must contain at least 8 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        departmentId:
          form.departmentId || null,
        active: form.active,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      const response = await fetch(
        editingId
          ? `/api/admin/faculty/${editingId}`
          : "/api/admin/faculty",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save faculty"
        );
      }

      closeModal();
      await loadFaculty();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save faculty"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteFaculty(id: string) {
    const confirmed = window.confirm(
      "Delete this faculty account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/faculty/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete faculty"
        );
      }

      await loadFaculty();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete faculty"
      );
    }
  }

  const filteredFaculty = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faculty.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.department?.name
          .toLowerCase()
          .includes(query) ||
        item.department?.code
          .toLowerCase()
          .includes(query);

      const matchesDepartment =
        departmentFilter === "ALL" ||
        item.departmentId === departmentFilter;

      const matchesStatus =
        statusFilter === "ALL";

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    faculty,
    search,
    departmentFilter,
    statusFilter,
  ]);

  const totalFaculty = faculty.length;

  const assignedFaculty = faculty.filter(
    (item) => item._count.facultySubjects > 0
  ).length;

  const unassignedFaculty =
    totalFaculty - assignedFaculty;

  const departmentCount = new Set(
    faculty
      .map((item) => item.departmentId)
      .filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Administration / Faculty
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Faculty Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage faculty accounts, departments and subject assignments.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Faculty
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Users size={21} />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                TOTAL
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {totalFaculty}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Total Faculty
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <UserCheck size={21} />
              </div>

              <span className="text-xs font-semibold text-emerald-600">
                ASSIGNED
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {assignedFaculty}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Subject Assigned
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <UserX size={21} />
              </div>

              <span className="text-xs font-semibold text-amber-600">
                PENDING
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {unassignedFaculty}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              No Subject Assigned
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <Building2 size={21} />
              </div>

              <span className="text-xs font-semibold text-violet-600">
                ACADEMIC
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {departmentCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Departments Covered
            </p>
          </div>

        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search faculty, email or department..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <select
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(e.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="ALL">
                    All Departments
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="ALL">
                    All Status
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>

              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-sm text-slate-500">
              Loading faculty...
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="p-16 text-center">
              <Users
                size={44}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-900">
                No faculty found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create a faculty account to get started.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Add Faculty
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Faculty
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Department
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Subjects
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredFaculty.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                            {item.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <Link
                              href={`/admin/faculty/${item.id}`}
                              className="font-semibold text-slate-900 hover:text-indigo-600"
                            >
                              {item.name}
                            </Link>

                            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <Mail size={13} />
                              {item.email}
                            </div>
                          </div>

                        </div>
                      </td>

                      <td className="px-5 py-5">
                        {item.department ? (
                          <div>
                            <p className="font-semibold text-slate-800">
                              {item.department.name}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              {item.department.code}
                            </p>
                          </div>
                        ) : (
                          <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <Link
                          href={`/admin/faculty/${item.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          <BookOpen size={15} />
                          {item._count.facultySubjects}
                          <ArrowRight size={14} />
                        </Link>
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">

                          <Link
                            href={`/admin/faculty/${item.id}`}
                            className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Manage subjects"
                          >
                            <BookOpen size={17} />
                          </Link>

                          <button
                            onClick={() =>
                              openEdit(item)
                            }
                            className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit faculty"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() =>
                              deleteFaculty(item.id)
                            }
                            className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete faculty"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
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
                  {editingId
                    ? "Edit Faculty"
                    : "Create Faculty"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage faculty account and academic department.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Faculty full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="faculty@college.edu"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {!editingId && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Temporary Password
                  </label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              )}

              {editingId && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    placeholder="Leave empty to keep current password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department
                </label>

                <select
                  value={form.departmentId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      departmentId: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name} ({department.code})
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      active: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Active Faculty
                  </p>

                  <p className="text-xs text-slate-500">
                    Faculty account can access academic features.
                  </p>
                </div>
              </label>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={saveFaculty}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Faculty"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
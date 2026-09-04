"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Layers3,
  CalendarDays,
  ClipboardCheck,
  Megaphone,
  FileQuestion,
  BarChart3,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

const modules = [
  {
    title: "Students",
    description: "Manage student records and academic assignments.",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "Faculty",
    description: "Manage faculty accounts and department mapping.",
    href: "/admin/faculty",
    icon: GraduationCap,
  },
  {
    title: "Departments",
    description: "Configure institutional departments.",
    href: "/admin/departments",
    icon: Building2,
  },
  {
    title: "Courses",
    description: "Manage courses and department relationships.",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Semesters",
    description: "Configure course-wise academic semesters.",
    href: "/admin/semesters",
    icon: Layers3,
  },
  {
    title: "Subjects",
    description: "Manage semester subjects and academic structure.",
    href: "/admin/subjects",
    icon: BookOpen,
  },
  {
    title: "Timetable",
    description: "Manage official academic schedules.",
    href: "/admin/timetable",
    icon: CalendarDays,
  },
  {
    title: "Exams",
    description: "Manage examinations and academic schedules.",
    href: "/admin/exams",
    icon: ClipboardCheck,
  },
  {
    title: "Announcements",
    description: "Publish official institutional updates.",
    href: "/admin/announcements",
    icon: Megaphone,
  },
  {
    title: "Online Tests",
    description: "Create tests and manage student attempts.",
    href: "/admin/online-tests",
    icon: FileQuestion,
  },
  {
    title: "Reports",
    description: "View institutional academic analytics.",
    href: "/admin/reports",
    icon: BarChart3,
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl bg-slate-950 p-7 text-white shadow-xl lg:p-9">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-300">
                <ShieldCheck size={18} />
                <span className="text-sm font-semibold">
                  CampusMind AI Administration
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-4xl">
                Administrative Control Center
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Manage students, faculty, academic structure, examinations,
                communication and institutional data from one secure control
                center.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                System
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="font-semibold">
                  Administration Active
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Administration Modules
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Access and manage every major CampusMind AI administration area.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                      <Icon size={21} />
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-slate-300 transition group-hover:text-indigo-600"
                    />
                  </div>

                  <h3 className="mt-5 font-bold text-slate-900">
                    {module.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {module.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Academic Data Architecture
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            CampusMind AI uses a generic hierarchy so the same system works
            for CSE, ECE, EEE, Mechanical, Civil, IT, AI & DS and future
            departments without hard-coded department logic.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold">
            {[
              "Department",
              "Course",
              "Semester",
              "Subject",
              "Faculty",
              "Academic Activity",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="rounded-xl bg-slate-100 px-4 py-2 text-slate-700">
                  {item}
                </span>

                {index < 5 && (
                  <span className="text-slate-300">→</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
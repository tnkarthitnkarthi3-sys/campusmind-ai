"use client";

import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  ChartNoAxesCombined,
  NotebookTabs,
  Megaphone,
  FileQuestion,
  Building2,
  BarChart3,
  Settings2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const features = [
  "College profile",   "Principal information",   "Contact information",   "Address",   "Academic information",   "Official website and social links",
];

export default function Page() {
  const iconMap: Record<string, any> = {
    CalendarDays,
    ClipboardCheck,
    ClipboardList,
    ChartNoAxesCombined,
    NotebookTabs,
    Megaphone,
    FileQuestion,
    Building2,
    BarChart3,
    Settings2,
  };

  const Icon = iconMap["Building2"] || ShieldCheck;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Administration / Academic Management
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              College Information
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Maintain the official institutional information displayed throughout CampusMind AI.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Icon size={28} />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Module Status
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-900">
                Ready
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Administration module is available.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Access
            </p>

            <div className="mt-4 flex items-center gap-2">
              <ShieldCheck size={19} className="text-indigo-600" />
              <span className="font-semibold text-slate-900">
                Administrator
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Official institutional data is controlled by administrators.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Architecture
            </p>

            <div className="mt-4 font-semibold text-slate-900">
              Department → Course → Semester
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Generic academic hierarchy supports every department.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Icon size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Module Capabilities
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Planned production capabilities for this module.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                <span className="text-sm font-medium text-slate-700">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-indigo-950">
                Production-ready architecture
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-900/70">
                CampusMind AI keeps official academic data under administrator
                control. Students consume published information while faculty
                can manage their permitted academic activities.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
              CampusMind AI
              <ArrowRight size={17} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
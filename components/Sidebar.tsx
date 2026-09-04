"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Settings,
  Sparkles,
  Target,
  X,
} from "lucide-react";

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { label: "Assignments", href: "/assignments", icon: BookOpen },
  { label: "Study Planner", href: "/planner", icon: CalendarDays },
  { label: "Notes", href: "/notes", icon: NotebookPen },
  { label: "Exams", href: "/exams", icon: GraduationCap },
  { label: "Updates", href: "/updates", icon: FileText },
];

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="font-bold text-slate-900">CampusMind AI</div>
              <div className="text-[11px] text-slate-500">Student Workspace</div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-5">
          <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2 text-indigo-300">
              <Target size={17} />
              <span className="text-xs font-bold">Study goal</span>
            </div>
            <p className="mt-2 text-sm font-semibold">Keep your weekly streak alive.</p>
            <div className="mt-3 h-1.5 rounded-full bg-white/10">
              <div className="h-full w-[78%] rounded-full bg-indigo-400" />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">78% completed</p>
          </div>

          <Link
            href="/login"
            className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut size={18} />
            Sign out
          </Link>

          <div className="mt-2 flex items-center gap-3 px-3 text-xs text-slate-400">
            <Settings size={15} />
            CampusMind v1.0
          </div>
        </div>
      </aside>
    </>
  );
}

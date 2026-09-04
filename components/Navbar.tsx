"use client";

import { useState } from "react";
import {
  Bell,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";

type NavbarProps = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 sm:flex">
          <Search size={17} className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your workspace..."
            className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400 lg:w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="hidden items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 sm:flex">
          <Sparkles size={15} />
          AI Assistant
        </button>

        <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-slate-800">Student</p>
            <p className="text-xs text-slate-400">Academic account</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            ST
          </div>
        </div>
      </div>
    </header>
  );
}

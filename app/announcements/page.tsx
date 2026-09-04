"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  category: string;
  target: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/announcements", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok) {
          setItems(data.announcements || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = items.filter((item) => {
    const query = search.toLowerCase();

    return (
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-indigo-300">
            <Bell size={17} />
            CampusMind AI
          </div>

          <h1 className="text-3xl font-bold">
            Announcements
          </h1>

          <p className="mt-2 text-slate-400">
            Stay updated with official college announcements.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <Search size={18} className="text-slate-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-12 text-center text-slate-400">
            Loading announcements...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-12 text-center">
            <Bell className="mx-auto mb-4 text-slate-600" size={42} />

            <h2 className="font-semibold">
              No announcements available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New official announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-indigo-500/40 hover:bg-white/[0.06]"
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                    <Bell size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                        {item.category}
                      </span>

                      <span className="text-xs text-slate-600">
                        {item.publishedAt
                          ? new Date(
                              item.publishedAt
                            ).toLocaleDateString("en-IN")
                          : ""}
                      </span>
                    </div>

                    <h2 className="font-semibold">
                      {item.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                      {item.content}
                    </p>
                  </div>

                  <ChevronRight
                    className="mt-3 shrink-0 text-slate-600"
                    size={20}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900">
            <div className="flex items-start justify-between border-b border-white/10 p-6">
              <div>
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                  {selected.category}
                </span>

                <h2 className="mt-4 text-2xl font-bold">
                  {selected.title}
                </h2>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={14} />
                  {selected.publishedAt
                    ? new Date(
                        selected.publishedAt
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Recently published"}
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="whitespace-pre-wrap p-6 text-sm leading-7 text-slate-300">
              {selected.content}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

import AppShell from "@/components/AppShell";
import { Bell, CalendarDays, Megaphone, Pin } from "lucide-react";

const updates = [
  {
    title: "Internal assessment schedule published",
    text: "The updated assessment schedule is now available for students.",
    date: "Today",
    type: "Academic",
  },
  {
    title: "Library timing extended",
    text: "The central library will remain open until 9:00 PM during exam preparation weeks.",
    date: "Yesterday",
    type: "Campus",
  },
  {
    title: "Assignment submission reminder",
    text: "Database Systems report submissions close this Friday.",
    date: "Sep 1",
    type: "Reminder",
  },
];

export default function UpdatesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Updates</h1>
          <p className="mt-2 text-sm text-slate-500">
            Stay informed about academic and campus announcements.
          </p>
        </div>

        <div className="space-y-4">
          {updates.map((update, index) => (
            <article
              key={update.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {index === 0 ? <Megaphone size={20} /> : index === 1 ? <Bell size={20} /> : <Pin size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-bold text-slate-900">{update.title}</h2>
                    <span className="text-xs text-slate-400">{update.date}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{update.text}</p>
                  <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                    {update.type}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

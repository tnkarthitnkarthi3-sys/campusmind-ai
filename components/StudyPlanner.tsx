const sessions = [
  { time: "06:30 PM", title: "Data Structures", duration: "60 min" },
  { time: "08:00 PM", title: "Database Systems", duration: "45 min" },
  { time: "09:00 PM", title: "Revision & Quiz", duration: "30 min" },
];

export default function StudyPlanner() {
  return (
    <div className="space-y-3">
      {sessions.map((session, index) => (
        <div
          key={session.title}
          className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
        >
          <div className="w-20 shrink-0 text-xs font-bold text-indigo-600">
            {session.time}
          </div>
          <div className="relative flex-1">
            {index !== sessions.length - 1 && (
              <span className="absolute -bottom-7 left-0.5 h-7 w-px bg-slate-200" />
            )}
            <p className="font-semibold text-slate-800">{session.title}</p>
            <p className="mt-1 text-xs text-slate-500">{session.duration}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

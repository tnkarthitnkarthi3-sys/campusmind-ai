type AssignmentCardProps = {
  title: string;
  subject: string;
  due: string;
  priority: "High" | "Medium" | "Low";
};

const priorityStyles = {
  High: "bg-rose-50 text-rose-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-emerald-50 text-emerald-600",
};

export default function AssignmentCard({
  title,
  subject,
  due,
  priority,
}: AssignmentCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {subject} • Due {due}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${priorityStyles[priority]}`}
      >
        {priority}
      </span>
    </div>
  );
}

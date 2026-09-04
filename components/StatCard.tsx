type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  icon: React.ReactNode;
  tone?: "indigo" | "emerald" | "amber" | "rose";
};

const tones = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  tone = "indigo",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${tones[tone]}`}>{icon}</div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        {trend && <span className="font-bold text-emerald-600">{trend}</span>}
        <span className="text-slate-400">{subtitle}</span>
      </div>
    </div>
  );
}

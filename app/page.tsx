import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  Target,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Student Dashboard",
    description: "See attendance, assignments, exams and academic progress in one place.",
  },
  {
    icon: Brain,
    title: "AI Study Assistant",
    description: "Get personalized answers, study guidance and smart academic recommendations.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Planner",
    description: "Organize classes, assignments, exams and daily study sessions.",
  },
  {
    icon: MessageCircle,
    title: "Notes Q&A",
    description: "Turn your notes into an interactive learning assistant.",
  },
];

const highlights = [
  "Personalized study planning",
  "Attendance monitoring",
  "Assignment tracking",
  "Exam preparation",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Brain size={22} />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900">
                CampusMind AI
              </div>
              <div className="text-xs text-slate-500">Smart Student Platform</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#e0e7ff,transparent_35%),radial-gradient(circle_at_top_left,#f0fdf4,transparent_30%)]" />

        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              <Sparkles size={16} />
              AI-powered academic companion
            </div>

            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Study smarter.
              <span className="block text-indigo-600">Achieve more.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CampusMind AI brings your attendance, assignments, exams, notes and
              personalized study planning together in one intelligent platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Get started
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/planner"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Explore planner
              </Link>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70">
              <div className="rounded-2xl bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Good morning</p>
                    <h2 className="mt-1 text-2xl font-bold">Your academic overview</h2>
                  </div>
                  <div className="rounded-xl bg-indigo-500/20 p-3 text-indigo-300">
                    <GraduationCap size={24} />
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-slate-400">Attendance</p>
                    <p className="mt-2 text-2xl font-bold">92%</p>
                    <p className="mt-1 text-xs text-emerald-300">+4.2% this month</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-slate-400">Assignments</p>
                    <p className="mt-2 text-2xl font-bold">8</p>
                    <p className="mt-1 text-xs text-amber-300">3 due this week</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Weekly study progress</p>
                    <Target size={18} className="text-indigo-300" />
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[78%] rounded-full bg-indigo-400" />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">78% of your weekly goal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Everything in one place
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Built around your academic life
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={21} />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

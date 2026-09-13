"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";

type Role = "STUDENT" | "FACULTY" | "ADMIN";

const roles: {
  value: Role;
  label: string;
  description: string;
  icon: typeof GraduationCap;
}[] = [
  {
    value: "STUDENT",
    label: "Student",
    description: "Access your academic dashboard",
    icon: GraduationCap,
  },
  {
    value: "FACULTY",
    label: "Faculty",
    description: "Manage students and academics",
    icon: Users,
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Manage the CampusMind system",
    icon: ShieldCheck,
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (!role) {
      setError("Please select your role.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || data.error || "Invalid login credentials.");
        setLoading(false);
        return;
      }

      const loggedInRole = data.role || data.user?.role;

      if (loggedInRole && loggedInRole !== role) {
        setError(
          `This account is registered as ${String(
            loggedInRole
          ).toLowerCase()}. Please select the correct role.`
        );
        setLoading(false);
        return;
      }

      let redirectTo = data.redirectTo;

      if (!redirectTo) {
        if (loggedInRole === "ADMIN") {
          redirectTo = "/admin";
        } else if (loggedInRole === "FACULTY") {
          redirectTo = "/faculty";
        } else {
          redirectTo = "/dashboard";
        }
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to CampusMind. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="relative min-h-screen overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.20),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.18),_transparent_35%)]" />

        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[360px] w-[360px] rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-2">
            {/* Left branding section */}
            <section className="hidden min-h-[720px] flex-col justify-between border-r border-white/10 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-violet-600/20 p-10 lg:flex">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <div>
                    <h1 className="text-xl font-bold tracking-tight">
                      CampusMind AI
                    </h1>
                    <p className="text-xs text-blue-200">
                      Intelligent Academic Platform
                    </p>
                  </div>
                </div>

                <div className="mt-24 max-w-lg">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
                    <Sparkles className="h-4 w-4" />
                    AI-powered learning
                  </div>

                  <h2 className="text-5xl font-bold leading-tight tracking-tight">
                    Learn smarter.
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                      Perform better.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
                    Your intelligent academic companion for attendance,
                    assignments, exams, notes, planning and personalized
                    learning insights.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-2xl font-bold">AI</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Smart assistance
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Academic support
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-2xl font-bold">100%</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Personalized
                  </p>
                </div>
              </div>
            </section>

            {/* Login section */}
            <section className="flex min-h-[720px] items-center justify-center bg-[#091523]/80 p-6 sm:p-10">
              <div className="w-full max-w-md">
                {/* Mobile branding */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <h1 className="font-bold">CampusMind AI</h1>
                    <p className="text-xs text-slate-400">
                      Intelligent Academic Platform
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-400/20">
                    <Lock className="h-6 w-6 text-blue-400" />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Sign in to CampusMind
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Continue your academic journey.
                  </p>
                </div>

                {/* Role selector */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-200">
                      Select your role
                    </label>

                    <span className="text-xs text-blue-400">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((item) => {
                      const Icon = item.icon;
                      const active = role === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setRole(item.value);
                            setError("");
                          }}
                          className={`group rounded-2xl border p-3 text-left transition-all duration-200 ${
                            active
                              ? "border-blue-500/70 bg-blue-500/15 shadow-lg shadow-blue-500/10"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                          }`}
                        >
                          <div
                            className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${
                              active
                                ? "bg-blue-500 text-white"
                                : "bg-white/5 text-slate-400 group-hover:text-white"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <p
                            className={`text-xs font-semibold ${
                              active ? "text-white" : "text-slate-300"
                            }`}
                          >
                            {item.label}
                          </p>

                          <p className="mt-1 hidden text-[10px] leading-4 text-slate-500 sm:block">
                            {item.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Enter your email"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-12 pr-24 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                        disabled={loading}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                        disabled={loading}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300">
                      {error}
                    </div>
                  )}

                  {/* Selected role */}
                  <div className="flex items-center gap-2 rounded-xl border border-blue-500/10 bg-blue-500/5 px-4 py-3 text-xs text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    Signing in as{" "}
                    <span className="font-semibold text-blue-300">
                      {roles.find((item) => item.value === role)?.label}
                    </span>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Security */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4" />
                  Secure authenticated session
                </div>

                {/* Register */}
                <p className="mt-6 text-center text-sm text-slate-500">
                  New to CampusMind?{" "}
                  <a
                    href="/register"
                    className="font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    Create an account
                  </a>
                </p>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  Powered by CampusMind Intelligence
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

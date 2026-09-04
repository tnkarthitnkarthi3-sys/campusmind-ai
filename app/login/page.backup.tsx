"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Brain, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-indigo-600 p-10 text-white lg:block">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2.5">
              <Brain size={22} />
            </div>
            <span className="font-bold">CampusMind AI</span>
          </Link>

          <div className="mt-24">
            <p className="text-sm font-semibold text-indigo-200">WELCOME BACK</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">
              Your smarter academic journey starts here.
            </h1>
            <p className="mt-5 leading-7 text-indigo-100">
              Manage your studies, track your progress and use AI to build better learning habits.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
            ← Back to home
          </Link>

          <div className="mt-10">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">
              Access your CampusMind workspace.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                window.location.href = "/dashboard";
              }}
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-indigo-400">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="student@example.com"
                    className="w-full py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-indigo-400">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-700"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Lightbulb,
  Menu,
  MessageSquare,
  Mic,
  Plus,
  Send,
  Sparkles,
  Target,
  X,
} from "lucide-react";

const suggestions = [
  {
    icon: FileText,
    title: "Summarize my notes",
    text: "Summarize my Database Management notes",
  },
  {
    icon: Lightbulb,
    title: "Explain a topic",
    text: "Explain process synchronization simply",
  },
  {
    icon: Brain,
    title: "Generate a quiz",
    text: "Create a quiz on Computer Networks",
  },
  {
    icon: Target,
    title: "Make a study plan",
    text: "Create a revision plan for my next exam",
  },
];

const recentActivity = [
  {
    title: "Process Scheduling",
    type: "Topic explanation",
    time: "Today, 4:10 PM",
  },
  {
    title: "Database Normalization",
    type: "Notes summary",
    time: "Today, 2:35 PM",
  },
  {
    title: "Computer Networks",
    type: "Quiz generated",
    time: "Yesterday, 7:20 PM",
  },
];

export default function AIAssistantPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sentMessage, setSentMessage] = useState("");

  function sendMessage() {
    if (!message.trim()) return;

    setSentMessage(message.trim());
    setMessage("");
  }

  function useSuggestion(text: string) {
    setMessage(text);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {mobileOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <BookOpen size={21} />
                </div>
                <div>
                  <p className="font-bold tracking-tight">CampusMind AI</p>
                  <p className="text-xs text-slate-500">
                    Smart Student Platform
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6">
              <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Academic
              </p>

              <div className="space-y-1">
                <NavItem href="/dashboard" icon={GraduationCap} label="Dashboard" />
                <NavItem href="/attendance" icon={CheckCircle2} label="Attendance" />
                <NavItem href="/assignments" icon={FileText} label="Assignments" />
                <NavItem href="/planner" icon={Target} label="Study Planner" />
                <NavItem href="/notes" icon={BookOpen} label="Notes" />
                <NavItem href="/exams" icon={Clock3} label="Exams" />
              </div>

              <p className="px-3 pb-3 pt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Intelligence
              </p>

              <div className="space-y-1">
                <NavItem
                  href="/ai-assistant"
                  icon={Bot}
                  label="AI Study Assistant"
                  active
                />
              </div>
            </nav>

            <div className="border-t border-slate-100 p-4">
              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Sparkles size={17} />
                </div>
                <p className="text-sm font-semibold">Need help studying?</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Ask CampusMind AI about any academic topic.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex h-20 items-center justify-between px-5 sm:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="rounded-xl border border-slate-200 p-2 lg:hidden"
                >
                  <Menu size={20} />
                </button>

                <div>
                  <p className="text-sm text-slate-500">
                    Dashboard / AI Study Assistant
                  </p>
                  <h1 className="text-xl font-bold">AI Study Assistant</h1>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <span className="text-sm font-bold">RK</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Karthikeyan</p>
                  <p className="text-xs text-slate-500">Computer Science</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-5 sm:p-8">
            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950 p-7 text-white shadow-sm sm:p-10">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200">
                  <Sparkles size={16} />
                  AI-powered learning companion
                </div>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Study smarter with
                  <span className="text-cyan-400"> CampusMind AI.</span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Ask questions, understand difficult concepts, summarize your
                  notes, generate quizzes and create personalized revision plans.
                </p>
              </div>
            </section>

            <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_320px]">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Ask your AI tutor</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Ask anything about your studies.
                    </p>
                  </div>

                  <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    AI Ready
                  </div>
                </div>

                <div className="min-h-[280px] rounded-2xl bg-slate-50 p-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Bot size={20} />
                    </div>

                    <div className="max-w-xl rounded-2xl rounded-tl-none bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold">
                        Hello Karthikeyan 👋
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        I&apos;m your CampusMind AI study assistant. Tell me
                        what you&apos;re learning and I&apos;ll help you understand
                        it step by step.
                      </p>
                    </div>
                  </div>

                  {sentMessage && (
                    <div className="mt-5 flex justify-end">
                      <div className="max-w-xl rounded-2xl rounded-tr-none bg-indigo-600 p-4 text-sm text-white shadow-sm">
                        {sentMessage}
                      </div>
                    </div>
                  )}

                  {sentMessage && (
                    <div className="mt-5 flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <Bot size={20} />
                      </div>

                      <div className="max-w-xl rounded-2xl rounded-tl-none bg-white p-4 shadow-sm">
                        <p className="text-sm leading-6 text-slate-600">
                          Great question! AI response generation will be
                          connected in the next integration phase. For now,
                          your conversation interface is ready.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-2">
                  <div className="flex items-center gap-2">
                    <button className="hidden rounded-xl p-3 text-slate-400 hover:bg-slate-100 sm:block">
                      <Plus size={20} />
                    </button>

                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") sendMessage();
                      }}
                      placeholder="Ask CampusMind AI anything..."
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                    />

                    <button className="hidden rounded-xl p-3 text-slate-400 hover:bg-slate-100 sm:block">
                      <Mic size={20} />
                    </button>

                    <button
                      onClick={sendMessage}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-indigo-700"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-7">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Try asking</h3>
                      <p className="text-xs text-slate-500">
                        Quick prompts to get started
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {suggestions.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.title}
                          onClick={() => useSuggestion(item.text)}
                          className="group flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-white">
                            <Icon size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {item.text}
                            </p>
                          </div>

                          <ChevronRight
                            size={17}
                            className="ml-auto mt-2 text-slate-300"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold">AI capabilities</h3>
                      <p className="text-xs text-slate-500">
                        Your learning toolkit
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      "Explain difficult concepts",
                      "Summarize study notes",
                      "Generate practice quizzes",
                      "Create revision plans",
                      "Help with exam preparation",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-sm text-slate-600"
                      >
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Recent activity</h3>
                      <p className="text-xs text-slate-500">
                        Your latest AI sessions
                      </p>
                    </div>
                    <Clock3 size={18} className="text-slate-400" />
                  </div>

                  <div className="mt-5 space-y-4">
                    {recentActivity.map((item) => (
                      <div
                        key={item.title}
                        className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                      >
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-indigo-600">
                          {item.type}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <Link
                  href="/planner"
                  className="group block rounded-3xl bg-slate-950 p-6 text-white"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Target size={20} />
                  </div>
                  <h3 className="font-bold">Build your study plan</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Turn your upcoming exams and assignments into a focused
                    weekly schedule.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-cyan-400">
                    Open Study Planner
                    <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </div>
                </Link>
              </aside>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>CampusMind AI • AI Study Assistant</p>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-semibold text-slate-600 hover:text-indigo-600"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: typeof BookOpen;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Loader2,
  MessageCircle,
  Sparkles,
  Target,
  UserRound,
  X,
  Zap,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const quickPrompts = [
  {
    title: "Summarize my notes",
    description: "Summarize your saved notes for quick revision.",
    icon: BookOpen,
    prompt:
      "Summarize my saved notes. Group the important points by subject and tell me what I should revise first.",
  },
  {
    title: "Explain a topic",
    description: "Understand difficult topics step by step.",
    icon: Brain,
    prompt:
      "Explain an important Computer Science topic from my academic data in a simple student-friendly way with an example.",
  },
  {
    title: "Generate a quiz",
    description: "Practice with questions from your subjects.",
    icon: Target,
    prompt:
      "Create a 10-question practice quiz based on my saved notes and current subjects. Include the answers at the end.",
  },
  {
    title: "Make a study plan",
    description: "Prepare around your upcoming exams.",
    icon: CalendarDays,
    prompt:
      "Create a practical study plan based on my upcoming exams, assignments, notes, and study sessions. Prioritize the most urgent work.",
  },
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello Karthikeyan 👋\n\nI'm your CampusMind AI study assistant. I can help you understand difficult concepts, summarize your notes, prepare quizzes, and plan your revision using your academic data.\n\nAsk me something about your studies.",
  },
];

function MessageContent({ content }: { content: string }) {
  return (
    <div className="whitespace-pre-wrap leading-7">
      {content}
    </div>
  );
}

export default function AIAssistantPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data?.user) {
          setUser(data.user);
        }
      } catch {
        // Keep the page usable even if profile loading fails.
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [input]);

  async function sendMessage(customMessage?: string) {
    const message = (customMessage ?? input).trim();

    if (!message || sending) return;

    setInput("");
    setError("");

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setSending(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.error || "CampusMind AI could not process your request."
        );
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data.answer,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "AI service is temporarily unavailable.";

      setError(errorMessage);

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content:
            "Sorry, I couldn't process that request right now. Please check your AI configuration and try again.",
        },
      ]);
    } finally {
      setSending(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages(initialMessages);
    setInput("");
    setError("");
  }

  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] || "Karthikeyan";

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">

        {/* HEADER */}
        <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-6 sm:px-8">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Sparkles className="h-7 w-7 text-indigo-300" />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-indigo-300">
                    <span>Dashboard</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>AI Study Assistant</span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    AI Study Assistant
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                    Your AI-powered learning companion for studying,
                    revision, exams and academic planning.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">

                <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <UserRound className="h-4 w-4 text-slate-200" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Student
                    </p>

                    <p className="max-w-36 truncate text-sm font-semibold text-white">
                      {loadingUser ? "Loading..." : firstName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>

                  <span className="text-xs font-semibold text-emerald-300">
                    AI Ready
                  </span>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* MAIN */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

          {/* CHAT */}
          <section className="flex min-h-[680px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* CHAT HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <MessageCircle className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Ask your AI tutor
                  </h2>

                  <p className="text-xs text-slate-500">
                    Ask anything about your studies.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearChat}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">

              <div className="mx-auto max-w-4xl space-y-5">

                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      {!isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[76%] ${
                          isUser
                            ? "rounded-br-md bg-slate-900 text-white"
                            : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        <MessageContent
                          content={message.content}
                        />
                      </div>

                      {isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <UserRound className="h-4 w-4 text-slate-600" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* THINKING */}
                {sending && (
                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3">

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                        CampusMind AI is thinking...
                      </div>

                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 sm:mx-6">
                {error}
              </div>
            )}

            {/* INPUT */}
            <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">

              <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-4xl"
              >
                <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Ask CampusMind AI anything about your studies..."
                    rows={1}
                    maxLength={4000}
                    disabled={sending}
                    className="max-h-[140px] min-h-[48px] w-full resize-none bg-transparent px-3 py-3 pr-14 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between px-1">
                  <p className="text-[11px] text-slate-400">
                    Enter to send · Shift + Enter for new line
                  </p>

                  <p className="text-[11px] text-slate-400">
                    {input.length}/4000
                  </p>
                </div>
              </form>
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="space-y-5">

            {/* QUICK PROMPTS */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-600" />

                  <h2 className="text-sm font-bold text-slate-900">
                    Try asking
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Quick prompts to get started.
                </p>
              </div>

              <div className="space-y-2.5">

                {quickPrompts.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      disabled={sending}
                      onClick={() =>
                        sendMessage(item.prompt)
                      }
                      className="group flex w-full items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-indigo-100 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Icon className="h-4 w-4 text-indigo-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                          {item.description}
                        </p>
                      </div>

                      <ChevronRight className="mt-1 h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-500" />
                    </button>
                  );
                })}

              </div>
            </section>

            {/* CAPABILITIES */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <Brain className="h-5 w-5 text-violet-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    AI capabilities
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your learning toolkit.
                  </p>
                </div>
              </div>

              <div className="space-y-3">

                {[
                  "Explain difficult concepts",
                  "Summarize study notes",
                  "Generate practice quizzes",
                  "Create revision plans",
                  "Help with exam preparation",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                    <p className="text-xs leading-5 text-slate-600">
                      {item}
                    </p>
                  </div>
                ))}

              </div>
            </section>

            {/* DATABASE CONTEXT */}
            <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5">

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Academic Context
                  </h2>

                  <p className="text-xs text-slate-500">
                    Connected to your CampusMind data.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">

                <div className="rounded-2xl border border-white bg-white/80 p-3">
                  <BookOpen className="mb-2 h-4 w-4 text-indigo-600" />

                  <p className="text-[11px] text-slate-500">
                    Notes
                  </p>

                  <p className="text-xs font-bold text-slate-800">
                    Connected
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/80 p-3">
                  <Target className="mb-2 h-4 w-4 text-violet-600" />

                  <p className="text-[11px] text-slate-500">
                    Assignments
                  </p>

                  <p className="text-xs font-bold text-slate-800">
                    Connected
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/80 p-3">
                  <CalendarDays className="mb-2 h-4 w-4 text-blue-600" />

                  <p className="text-[11px] text-slate-500">
                    Exams
                  </p>

                  <p className="text-xs font-bold text-slate-800">
                    Connected
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/80 p-3">
                  <Clock3 className="mb-2 h-4 w-4 text-emerald-600" />

                  <p className="text-[11px] text-slate-500">
                    Planner
                  </p>

                  <p className="text-xs font-bold text-slate-800">
                    Connected
                  </p>
                </div>

              </div>
            </section>

          </aside>
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row">

          <span>
            CampusMind AI • AI Study Assistant
          </span>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-semibold text-slate-700 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>

        </div>

      </div>
    </main>
  );
}
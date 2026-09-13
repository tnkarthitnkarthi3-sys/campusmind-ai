"use client";

import {
  Bot,
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  {
    title: "My assignments",
    text: "What assignments do I have?",
    icon: CalendarDays,
  },
  {
    title: "Upcoming exams",
    text: "When is my next exam?",
    icon: GraduationCap,
  },
  {
    title: "My timetable",
    text: "Show my timetable",
    icon: CalendarDays,
  },
  {
    title: "Faculty",
    text: "Who are the faculty members?",
    icon: UserRound,
  },
];

export default function SmartAssistantPage() {
  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! 👋 I'm CampusMind AI.\n\nI can help you with your timetable, assignments, exams, faculty, departments and academic questions.\n\nWhat would you like to know?",
      },
    ]);

  async function sendMessage(
    event?: FormEvent
  ) {
    event?.preventDefault();

    const text = input.trim();

    if (!text || loading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/smart-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Assistant request failed."
        );
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          result.answer ||
          "I couldn't generate an answer.",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function useSuggestion(
    text: string
  ) {
    setInput(text);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                <BrainCircuit
                  size={23}
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                  CampusMind AI
                </p>

                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Smart Campus Assistant
                </h1>
              </div>
            </div>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Your intelligent academic companion for
              college information, planning and
              everyday student questions.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
          >
            Dashboard
            <ChevronRight
              size={16}
            />
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 via-white to-cyan-50 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <Bot size={21} />
                </div>

                <div>
                  <p className="font-black text-slate-900">
                    CampusMind Intelligence
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs font-semibold text-slate-500">
                      Academic assistant online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[520px] overflow-y-auto px-4 py-5 sm:px-7">
              <div className="space-y-5">
                {messages.map(
                  (message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role ===
                        "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role ===
                        "assistant" && (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                          <Bot
                            size={16}
                          />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.role ===
                          "user"
                            ? "bg-violet-600 text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {
                          message.content
                        }
                      </div>

                      {message.role ===
                        "user" && (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                          <UserRound
                            size={15}
                          />
                        </div>
                      )}
                    </div>
                  )
                )}

                {loading && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <Bot
                        size={16}
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        CampusMind is thinking...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
              <form
                onSubmit={sendMessage}
                className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-50"
              >
                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Ask CampusMind AI anything..."
                  rows={1}
                  className="max-h-32 min-h-11 flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={
                    !input.trim() ||
                    loading
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send
                    size={18}
                  />
                </button>
              </form>

              <p className="mt-2 text-center text-[11px] text-slate-400">
                CampusMind AI uses your available
                academic data to provide relevant
                answers.
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={18}
                  className="text-violet-600"
                />

                <h2 className="font-black text-slate-900">
                  Quick Questions
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Start with one of these common
                campus questions.
              </p>

              <div className="mt-4 space-y-2">
                {suggestions.map(
                  (suggestion) => {
                    const Icon =
                      suggestion.icon;

                    return (
                      <button
                        key={
                          suggestion.text
                        }
                        type="button"
                        onClick={() =>
                          useSuggestion(
                            suggestion.text
                          )
                        }
                        className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                          <Icon
                            size={17}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800">
                            {
                              suggestion.title
                            }
                          </p>

                          <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {
                              suggestion.text
                            }
                          </p>
                        </div>

                        <ChevronRight
                          size={15}
                          className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500"
                        />
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <MessageCircle
                  size={20}
                />
              </div>

              <h2 className="mt-4 text-lg font-black">
                Ask naturally
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-300">
                You don't need special commands.
                Ask your question just like you
                would ask a faculty member or
                study partner.
              </p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-slate-300">
                “What should I study first
                based on my upcoming exams?”
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";

type Message = {
  role: "assistant" | "user";
  text: string;
};

export default function AIChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I’m your CampusMind AI assistant. Ask me about your study plan, assignments or exam preparation.",
    },
  ]);

  function sendMessage() {
    const value = input.trim();
    if (!value) return;

    setMessages((current) => [
      ...current,
      { role: "user", text: value },
      {
        role: "assistant",
        text: "I’m ready to help. AI responses will be connected to your backend in the next phase.",
      },
    ]);
    setInput("");
  }

  return (
    <div className="flex min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 p-5">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          <Bot size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-900">CampusMind AI</p>
          <p className="text-xs text-emerald-600">Assistant ready</p>
        </div>
        <Sparkles className="ml-auto text-indigo-400" size={18} />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Bot size={16} />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {message.text}
            </div>

            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-300">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            placeholder="Ask your AI assistant..."
            className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
          />
          <button
            onClick={sendMessage}
            className="rounded-lg bg-indigo-600 p-2.5 text-white hover:bg-indigo-700"
            aria-label="Send message"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

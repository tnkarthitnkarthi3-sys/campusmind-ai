"use client";

import {
  Bot,
  Brain,
  Check,
  Clipboard,
  GraduationCap,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Mode = "normal" | "beginner" | "exam" | "planner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const modes: {
  id: Mode;
  label: string;
  description: string;
  icon: typeof Brain;
}[] = [
  {
    id: "normal",
    label: "Normal",
    description: "General academic help",
    icon: Sparkles,
  },
  {
    id: "beginner",
    label: "Beginner",
    description: "Simple explanations",
    icon: Brain,
  },
  {
    id: "exam",
    label: "Exam",
    description: "Exam preparation",
    icon: GraduationCap,
  },
  {
    id: "planner",
    label: "Planner",
    description: "Build study plans",
    icon: Check,
  },
];

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: createId(),
      role: "assistant",
      content:
        "Hi! I'm CampusMind AI 🤖\n\nAsk me any academic question. You can also use the microphone to ask your question by voice.",
    },
  ]);

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("normal");
  const [loading, setLoading] = useState(false);

  const [recording, setRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(
    null
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef = useRef<Blob[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const question = (text ?? input).trim();

    if (!question || loading) {
      return;
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: question,
    };

    const conversation = [...messages, userMessage];

    setMessages(conversation);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          mode,
          messages: conversation
            .filter(
              (item) =>
                item.role === "user" ||
                item.role === "assistant"
            )
            .slice(-12)
            .map((item) => ({
              role: item.role,
              content: item.content,
            })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "AI request failed"
        );
      }

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: result.answer,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          id: createId(),
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

  async function startRecording() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert(
          "Microphone recording is not supported in this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) =>
          track.stop()
        );

        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        await transcribeAudio(blob);
      };

      mediaRecorderRef.current = recorder;

      recorder.start();

      setRecording(true);
    } catch (error) {
      console.error(error);

      alert(
        "Microphone permission was denied or unavailable."
      );
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      return;
    }

    if (recorder.state !== "inactive") {
      recorder.stop();
    }

    setRecording(false);
  }

  async function transcribeAudio(blob: Blob) {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "audio",
        blob,
        "campusmind-voice.webm"
      );

      const response = await fetch(
        "/api/voice/transcribe",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Transcription failed"
        );
      }

      const text = String(result.text || "").trim();

      if (!text) {
        throw new Error(
          "I could not understand the voice. Please try again."
        );
      }

      setInput(text);

      await sendMessage(text);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Voice input failed.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function speakMessage(message: Message) {
    if (message.role !== "assistant") {
      return;
    }

    try {
      if (speakingId === message.id) {
        audioRef.current?.pause();
        audioRef.current = null;
        setSpeakingId(null);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setSpeakingId(message.id);

      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message.content,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(
          () => null
        );

        throw new Error(
          result?.message || "Voice generation failed"
        );
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);

      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setSpeakingId(null);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setSpeakingId(null);
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      setSpeakingId(null);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to play AI voice."
      );
    }
  }

  async function copyMessage(message: Message) {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      setCopiedId(message.id);

      window.setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (error) {
      console.error(error);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  const activeMode = modes.find(
    (item) => item.id === mode
  );

  return (
    <div className="flex min-h-[720px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 px-5 py-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Bot size={26} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">
                  CampusMind AI
                </h1>

                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  ONLINE
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Your intelligent academic assistant
              </p>
            </div>
          </div>

          <div className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right sm:block">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Mode
            </p>
            <p className="text-sm font-semibold">
              {activeMode?.label}
            </p>
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="border-b border-slate-100 bg-slate-50 p-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {modes.map((item) => {
            const Icon = item.icon;
            const active = mode === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />

                  <span className="text-xs font-bold">
                    {item.label}
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-slate-400">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-4 md:p-6">
        {messages.map((message) => {
          const isUser = message.role === "user";
          const isSpeaking =
            speakingId === message.id;

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
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`max-w-[85%] ${
                  isUser
                    ? "items-end"
                    : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    isUser
                      ? "rounded-br-md bg-slate-950 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>

                {!isUser && (
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        void speakMessage(message)
                      }
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-white hover:text-indigo-600"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX size={13} />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} />
                          Listen
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void copyMessage(message)
                      }
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-white hover:text-indigo-600"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check size={13} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Clipboard size={13} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Bot size={18} />
            </div>

            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                CampusMind AI is thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2"
        >
          <div className="flex min-h-14 flex-1 items-end rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10">
            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder={
                recording
                  ? "Listening..."
                  : "Ask CampusMind AI anything..."
              }
              disabled={loading || recording}
              rows={1}
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

            <button
              type="button"
              onClick={
                recording
                  ? stopRecording
                  : () => void startRecording()
              }
              disabled={loading}
              title={
                recording
                  ? "Stop recording"
                  : "Ask by voice"
              }
              className={`mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                recording
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {recording ? (
                <MicOff size={18} />
              ) : (
                <Mic size={18} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <Loader2
                size={20}
                className="animate-spin"
              />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between px-1">
          <p className="text-[10px] text-slate-400">
            Enter to send · Shift + Enter for new line
          </p>

          <p className="flex items-center gap-1 text-[10px] text-slate-400">
            <Mic size={11} />
            Voice enabled
          </p>
        </div>
      </div>
    </div>
  );
}
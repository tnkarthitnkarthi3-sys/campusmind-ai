"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Square,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  language?: "ta" | "en";
};

type SpeechRecognitionResultEvent = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const quickPrompts = [
  "Explain Operating System in simple words",
  "Photosynthesis explain in Tamil",
  "Teach me Python loops step by step",
  "Explain Newton's laws with examples",
  "Create a short quiz about DBMS",
  "Help me prepare for tomorrow's exam",
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    language: "en",
    content:
      "Hi! I'm CampusMind AI Teacher. Ask me anything by typing or speaking. I can explain the topic in the same language you use — Tamil or English — and teach it step by step.",
  },
];

function detectLanguage(text: string): "ta" | "en" {
  const tamilPattern = /[\u0B80-\u0BFF]/;

  if (tamilPattern.test(text)) {
    return "ta";
  }

  const lower = text.toLowerCase();

  const tamilWords = [
    "enna",
    "epdi",
    "explain pannunga",
    "sollunga",
    "teach pannunga",
    "puriyala",
    "tamil",
    "na",
    "ah",
    "eppadi",
    "yen",
    "edhuku",
  ];

  if (tamilWords.some((word) => lower.includes(word))) {
    return "ta";
  }

  return "en";
}

function getLanguageName(language: "ta" | "en") {
  return language === "ta" ? "Tamil" : "English";
}

function getSpeechLanguage(language: "ta" | "en") {
  return language === "ta" ? "ta-IN" : "en-IN";
}

function getAssistantResponse(
  content: string,
  language: "ta" | "en",
  apiResponse: any
) {
  if (typeof apiResponse?.answer === "string" && apiResponse.answer.trim()) {
    return apiResponse.answer.trim();
  }

  if (typeof apiResponse?.response === "string" && apiResponse.response.trim()) {
    return apiResponse.response.trim();
  }

  if (typeof apiResponse?.message === "string" && apiResponse.message.trim()) {
    return apiResponse.message.trim();
  }

  if (typeof apiResponse?.text === "string" && apiResponse.text.trim()) {
    return apiResponse.text.trim();
  }

  if (language === "ta") {
    return `நிச்சயமாக. "${content}" பற்றி நான் எளிமையாக கற்றுக்கொடுக்கிறேன்.

முதலில் இந்த topic-ன் basic concept-ஐ புரிந்துகொள்வோம். பிறகு முக்கியமான points, ஒரு simple example, மற்றும் exam-ல் நினைவில் வைத்துக்கொள்ள வேண்டிய points ஆகியவற்றை step-by-step ஆக பார்க்கலாம்.

இந்த topic-க்கு இன்னும் specific question கேட்டால், அதை Tamil-லேயே தொடர்ந்து explain பண்ணுகிறேன்.`;
  }

  return `Sure. Let me teach you about "${content}" step by step.

First, we will understand the basic concept. Then I will explain the important points, give you a simple example, and finish with the key points you should remember for exams.

Ask me a follow-up question and I will continue teaching you in English.`;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState("");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const voiceTranscriptRef = useRef("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("campusmind-ai-messages");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        // Ignore invalid local storage.
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "campusmind-ai-messages",
      JSON.stringify(messages)
    );
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speakText(text: string, language: "ta" | "en", messageId: string) {
    if (!voiceEnabled || typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      setVoiceError("Your browser does not support voice output.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = getSpeechLanguage(language);
    utterance.rate = language === "ta" ? 0.9 : 0.95;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();

    const preferredVoice = voices.find((voice) => {
      const voiceLang = voice.lang.toLowerCase();

      if (language === "ta") {
        return voiceLang.startsWith("ta");
      }

      return voiceLang.startsWith("en");
    });

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setSpeakingId(messageId);
    };

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeakingId(null);
  }

  async function sendMessage(
    textOverride?: string,
    languageOverride?: "ta" | "en"
  ) {
    const content = (textOverride ?? input).trim();

    if (!content || loading) {
      return;
    }

    const language = languageOverride ?? detectLanguage(content);

    setInput("");
    setVoiceError("");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      language,
    };

    setMessages((previous) => [...previous, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,

          // Tell the existing AI backend exactly which language
          // the student expects for the teaching response.
          language,

          responseLanguage: getLanguageName(language),

          // Teacher mode.
          mode: "teacher",

          instructions:
            language === "ta"
              ? "Teach and explain in Tamil. Do not translate Tamil into English. Use simple Tamil, step-by-step teaching, examples, and exam-friendly points. If technical English terms are necessary, keep the technical term in English but explain its meaning in Tamil. Reply in Tamil."
              : "Teach and explain in English. Use simple English, step-by-step teaching, examples, and exam-friendly points. Reply in English.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "AI response failed."
        );
      }

      const answer = getAssistantResponse(content, language, data);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        language,
      };

      setMessages((previous) => [...previous, assistantMessage]);

      if (voiceEnabled) {
        setTimeout(() => {
          speakText(answer, language, assistantMessage.id);
        }, 100);
      }
    } catch (error) {
      console.error("AI ASSISTANT ERROR:", error);

      const errorMessage =
        language === "ta"
          ? "மன்னிக்கவும். இப்போது AI response கிடைக்கவில்லை. தயவுசெய்து மீண்டும் முயற்சி செய்யுங்கள்."
          : "Sorry. I couldn't get an AI response right now. Please try again.";

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorMessage,
        language,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } finally {
      setLoading(false);
    }
  }

  function startVoice() {
    setVoiceError("");

    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    voiceTranscriptRef.current = "";

    recognition.onstart = () => {
      setRecording(true);
      setVoiceError("");
      voiceTranscriptRef.current = "";
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText.trim()) {
        voiceTranscriptRef.current =
          `${voiceTranscriptRef.current} ${finalText}`.trim();

        setInput(voiceTranscriptRef.current);
      } else if (interimText.trim()) {
        setInput(
          `${voiceTranscriptRef.current} ${interimText}`.trim()
        );
      }
    };

    recognition.onerror = (event) => {
      console.error("SPEECH RECOGNITION ERROR:", event);

      setRecording(false);

      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone permission was blocked. Please allow microphone access in Chrome."
        );
      } else if (event.error === "no-speech") {
        setVoiceError("No speech detected. Please speak again.");
      } else if (event.error === "audio-capture") {
        setVoiceError("Microphone was not detected.");
      } else {
        setVoiceError(
          "Voice input failed. Please try speaking again."
        );
      }
    };

    recognition.onend = () => {
      setRecording(false);

      const finalText = voiceTranscriptRef.current.trim();

      if (!finalText) {
        return;
      }

      const detectedLanguage = detectLanguage(finalText);

      setInput("");

      sendMessage(finalText, detectedLanguage);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("VOICE START ERROR:", error);
      setRecording(false);
      setVoiceError("Could not start microphone.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    sendMessage();
  }

  function handleQuickPrompt(prompt: string) {
    const language = detectLanguage(prompt);

    setInput(prompt);

    setTimeout(() => {
      sendMessage(prompt, language);
    }, 50);
  }

  function clearChat() {
    stopSpeaking();

    const welcome: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      language: "en",
      content:
        "Chat cleared. Ask me anything. I can teach you in Tamil or English and speak the answer aloud.",
    };

    setMessages([welcome]);
    localStorage.removeItem("campusmind-ai-messages");
  }

  const latestAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col lg:flex-row">
        {/* LEFT SIDEBAR */}
        <aside className="hidden w-[290px] border-r border-white/10 bg-[#091525] p-5 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <GraduationCap size={25} />
            </div>

            <div>
              <h1 className="font-bold">CampusMind AI</h1>
              <p className="text-xs text-slate-400">
                Intelligent Student Teacher
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Brain size={18} className="text-cyan-300" />
              <span className="font-semibold">Teacher Mode</span>
            </div>

            <p className="text-sm leading-6 text-slate-400">
              Ask any academic or general question. CampusMind AI explains
              it step-by-step in the language you use.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={17} className="text-emerald-400" />
                Tamil Teaching
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Tamil question → Tamil explanation
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={17} className="text-emerald-400" />
                English Teaching
              </div>
              <p className="mt-1 text-xs text-slate-500">
                English question → English explanation
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={17} className="text-emerald-400" />
                Voice Tutor
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Speak → Learn → Listen
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <section className="flex min-h-screen flex-1 flex-col">
          {/* HEADER */}
          <header className="flex items-center justify-between border-b border-white/10 bg-[#081321]/95 px-4 py-4 backdrop-blur-xl md:px-7">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-300" />
                <h2 className="font-bold">AI Teacher</h2>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Learn in Tamil or English • Text + Voice
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setVoiceEnabled((value) => {
                    if (value) {
                      stopSpeaking();
                    }

                    return !value;
                  });
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  voiceEnabled
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                {voiceEnabled ? (
                  <Volume2 size={16} />
                ) : (
                  <VolumeX size={16} />
                )}

                {voiceEnabled ? "Voice On" : "Voice Off"}
              </button>

              <button
                type="button"
                onClick={clearChat}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>
            </div>
          </header>

          {/* CHAT */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto max-w-4xl">
              {messages.map((message) => {
                const isUser = message.role === "user";
                const isSpeaking = speakingId === message.id;

                return (
                  <div
                    key={message.id}
                    className={`mb-7 flex gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <Bot size={19} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] ${
                        isUser
                          ? "rounded-2xl rounded-tr-md bg-cyan-500 px-4 py-3 text-white"
                          : "rounded-2xl rounded-tl-md border border-white/10 bg-[#101d2d] px-4 py-4"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-7">
                        {message.content}
                      </div>

                      {!isUser && (
                        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                          <span className="mr-auto text-[11px] text-slate-500">
                            {message.language === "ta"
                              ? "Tamil Teacher"
                              : "English Teacher"}
                          </span>

                          {isSpeaking ? (
                            <button
                              type="button"
                              onClick={stopSpeaking}
                              className="flex items-center gap-1.5 rounded-lg bg-cyan-400/10 px-2.5 py-1.5 text-xs text-cyan-200"
                            >
                              <Square size={12} />
                              Stop
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                speakText(
                                  message.content,
                                  message.language || "en",
                                  message.id
                                )
                              }
                              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                            >
                              <Volume2 size={13} />
                              Listen
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300">
                        <User size={18} />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="mb-7 flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Bot size={19} />
                  </div>

                  <div className="rounded-2xl rounded-tl-md border border-white/10 bg-[#101d2d] px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Loader2 size={16} className="animate-spin" />
                      Teaching...
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="mt-10">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Lightbulb size={17} className="text-yellow-300" />
                    Try asking
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleQuickPrompt(prompt)}
                        className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                      >
                        <span>{prompt}</span>
                        <ChevronRight
                          size={17}
                          className="shrink-0 text-slate-600 transition group-hover:text-cyan-300"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* VOICE STATUS */}
          {recording && (
            <div className="px-4 md:px-8">
              <div className="mx-auto mb-3 flex max-w-4xl items-center justify-between rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-400/10">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-red-200">
                      Listening...
                    </p>
                    <p className="text-xs text-slate-500">
                      Speak your question in Tamil or English
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => recognitionRef.current?.stop()}
                  className="flex items-center gap-2 rounded-xl bg-red-400/10 px-3 py-2 text-xs text-red-200"
                >
                  <Square size={13} />
                  Stop
                </button>
              </div>
            </div>
          )}

          {voiceError && (
            <div className="px-4 md:px-8">
              <div className="mx-auto mb-3 flex max-w-4xl items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-200">
                <X size={15} />
                {voiceError}
              </div>
            </div>
          )}

          {/* INPUT */}
          <div className="border-t border-white/10 bg-[#081321] p-4 md:p-6">
            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-4xl"
            >
              <div className="rounded-2xl border border-white/10 bg-[#101d2d] p-2 shadow-2xl shadow-black/20">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask anything... / எதையும் கேளுங்கள்..."
                  rows={2}
                  className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
                />

                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startVoice}
                      disabled={loading}
                      title={
                        recording
                          ? "Stop listening"
                          : "Ask using voice"
                      }
                      className={`flex h-10 items-center gap-2 rounded-xl px-3 transition ${
                        recording
                          ? "bg-red-400/10 text-red-300"
                          : "bg-white/5 text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-200"
                      }`}
                    >
                      {recording ? (
                        <>
                          <MicOff size={18} />
                          <span className="hidden text-xs sm:inline">
                            Stop
                          </span>
                        </>
                      ) : (
                        <>
                          <Mic size={18} />
                          <span className="hidden text-xs sm:inline">
                            Speak
                          </span>
                        </>
                      )}
                    </button>

                    <span className="hidden text-[11px] text-slate-600 sm:block">
                      Tamil / English voice
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="flex h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Send size={17} />
                    )}
                    <span className="hidden sm:inline">Ask AI</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                <span>
                  CampusMind AI • Smart Teaching Mode
                </span>

                <span>
                  {voiceEnabled ? "🔊 Voice enabled" : "🔇 Voice disabled"}
                </span>
              </div>
            </form>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden w-[270px] border-l border-white/10 bg-[#091525] p-5 xl:block">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Brain size={18} className="text-cyan-300" />
              <span className="font-semibold">How it teaches</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-cyan-200">
                  01 • Understand
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Understands your question and detects Tamil or English.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-cyan-200">
                  02 • Explain
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Explains the concept step by step like a teacher.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-cyan-200">
                  03 • Example
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Adds simple examples when useful.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-cyan-200">
                  04 • Speak
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Reads the answer aloud in the same language.
                </p>
              </div>
            </div>
          </div>

          {latestAssistant && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                <Volume2 size={14} />
                Current voice
              </div>

              <p className="text-sm font-medium">
                {latestAssistant.language === "ta"
                  ? "Tamil"
                  : "English"}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {getSpeechLanguage(
                  latestAssistant.language || "en"
                )}
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}


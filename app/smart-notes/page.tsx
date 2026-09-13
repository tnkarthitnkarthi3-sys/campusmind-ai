"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  ListChecks,
  GraduationCap,
  Layers3,
  CircleHelp,
  MessageCircleQuestion,
  Copy,
  Download,
  Check,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";

type AIAction =
  | "summary"
  | "important"
  | "beginner"
  | "flashcards"
  | "mcq";

type Result = {
  action: AIAction;
  answer: string;
};

const actions: {
  id: AIAction;
  title: string;
  description: string;
  icon: typeof Sparkles;
}[] = [
  {
    id: "summary",
    title: "AI Summary",
    description: "Get a clear study summary",
    icon: Sparkles,
  },
  {
    id: "important",
    title: "Important Points",
    description: "Find exam-focused points",
    icon: ListChecks,
  },
  {
    id: "beginner",
    title: "Beginner Mode",
    description: "Understand difficult topics",
    icon: GraduationCap,
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Create quick revision cards",
    icon: Layers3,
  },
  {
    id: "mcq",
    title: "MCQ Generator",
    description: "Practice with questions",
    icon: CircleHelp,
  },
];

export default function SmartNotesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [noteText, setNoteText] = useState("");
  const [stats, setStats] = useState<{
    characters: number;
    words: number;
  } | null>(null);

  const [activeAction, setActiveAction] =
    useState<AIAction>("summary");

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState("");

  const [dragActive, setDragActive] = useState(false);

  async function processFile(selectedFile: File) {
    setError("");
    setResult(null);
    setAnswer("");
    setQuestion("");

    const allowed = [
      "application/pdf",
      "text/plain",
      "text/markdown",
    ];

    const extension = selectedFile.name
      .split(".")
      .pop()
      ?.toLowerCase();

    const validExtension = ["pdf", "txt", "md"].includes(
      extension || ""
    );

    if (!allowed.includes(selectedFile.type) && !validExtension) {
      setError("Please upload a PDF, TXT, or Markdown file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    setFile(selectedFile);
    setExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/notes/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to extract the file."
        );
      }

      setNoteText(data.text || "");

      setStats({
        characters: data.characters || 0,
        words: data.words || 0,
      });
    } catch (err) {
      setFile(null);
      setNoteText("");
      setStats(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to process the file."
      );
    } finally {
      setExtracting(false);
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected = event.target.files?.[0];

    if (selected) {
      void processFile(selected);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      void processFile(droppedFile);
    }
  }

  async function generateAI(action: AIAction) {
    if (!noteText.trim()) {
      setError("Upload a study note first.");
      return;
    }

    setError("");
    setCopied(false);
    setActiveAction(action);
    setLoading(true);

    try {
      const response = await fetch("/api/notes/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: noteText,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "AI processing failed."
        );
      }

      setResult({
        action,
        answer: data.answer,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "AI processing failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function askQuestion() {
    if (!noteText.trim()) {
      setError("Upload a study note first.");
      return;
    }

    if (!question.trim()) {
      setError("Enter a question first.");
      return;
    }

    setError("");
    setAnswer("");
    setAsking(true);

    try {
      const response = await fetch("/api/notes/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteText,
          question,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to answer the question."
        );
      }

      setAnswer(data.answer);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to answer the question."
      );
    } finally {
      setAsking(false);
    }
  }

  async function copyResult(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError("Unable to copy the result.");
    }
  }

  function downloadText(text: string, filename: string) {
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function clearNote() {
    setFile(null);
    setNoteText("");
    setStats(null);
    setResult(null);
    setAnswer("");
    setQuestion("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const activeTitle =
    actions.find((item) => item.id === activeAction)?.title ||
    "AI Result";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                CampusMind AI
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Smart Notes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Upload your study material and turn it into
                summaries, flashcards, MCQs and easy explanations
                using AI.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-slate-400">Formats</p>
                <p className="mt-1 font-bold">PDF / TXT / MD</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-slate-400">AI Tools</p>
                <p className="mt-1 font-bold">5 Modes</p>
              </div>

              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:col-span-1">
                <p className="text-xs text-slate-400">Limit</p>
                <p className="mt-1 font-bold">10 MB</p>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <X className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Left */}
          <aside className="space-y-6">
            {/* Upload */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
              <div className="mb-4">
                <h2 className="font-bold">1. Upload Notes</h2>
                <p className="mt-1 text-xs text-slate-500">
                  PDF, TXT or Markdown up to 10 MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                    dragActive
                      ? "border-indigo-400 bg-indigo-500/10"
                      : "border-white/10 bg-white/[0.02] hover:border-indigo-400/50 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                    <Upload className="h-7 w-7" />
                  </div>

                  <p className="font-semibold">
                    Drop your notes here
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    or click to browse files
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      onClick={clearNote}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
                      aria-label="Remove note"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {extracting && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Extracting study content...
                    </div>
                  )}

                  {!extracting && stats && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-[11px] text-slate-500">
                          Words
                        </p>
                        <p className="mt-1 font-bold">
                          {stats.words.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-[11px] text-slate-500">
                          Characters
                        </p>
                        <p className="mt-1 font-bold">
                          {stats.characters.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* AI actions */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
              <div className="mb-4">
                <h2 className="font-bold">2. AI Study Tools</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Choose how CampusMind should process your notes
                </p>
              </div>

              <div className="space-y-2">
                {actions.map((item) => {
                  const Icon = item.icon;
                  const active = activeAction === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => void generateAI(item.id)}
                      disabled={!noteText || loading || extracting}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-indigo-400/40 bg-indigo-500/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          {/* Right */}
          <section className="space-y-6">
            {/* Extracted note */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold">Study Material</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Extracted content from your uploaded file
                  </p>
                </div>

                {noteText && (
                  <button
                    onClick={() =>
                      void copyResult(noteText)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/5 bg-black/20 p-4">
                {noteText ? (
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {noteText}
                  </p>
                ) : (
                  <div className="flex min-h-40 flex-col items-center justify-center text-center">
                    <BookOpen className="mb-3 h-8 w-8 text-slate-700" />
                    <p className="text-sm font-medium text-slate-500">
                      Your extracted study material will appear here.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Upload a PDF, TXT or MD file to begin.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI result */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-300" />
                    <h2 className="font-bold">
                      {activeTitle}
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    AI-generated study material
                  </p>
                </div>

                {result && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        void copyResult(result.answer)
                      }
                      className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10"
                      title="Copy result"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={() =>
                        downloadText(
                          result.answer,
                          `campusmind-${result.action}.txt`
                        )
                      }
                      className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10"
                      title="Download result"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() =>
                        void generateAI(activeAction)
                      }
                      disabled={loading || !noteText}
                      className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10 disabled:opacity-40"
                      title="Regenerate"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="min-h-72 rounded-2xl border border-white/5 bg-black/20 p-5">
                {loading ? (
                  <div className="flex min-h-60 flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
                      <Loader2 className="h-7 w-7 animate-spin text-indigo-300" />
                    </div>

                    <p className="font-semibold">
                      CampusMind AI is thinking...
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Creating your study material
                    </p>
                  </div>
                ) : result ? (
                  <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {result.answer}
                  </div>
                ) : (
                  <div className="flex min-h-60 flex-col items-center justify-center text-center">
                    <Sparkles className="mb-4 h-10 w-10 text-slate-700" />

                    <p className="font-semibold text-slate-400">
                      AI results will appear here
                    </p>

                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-600">
                      Upload your notes and select an AI study tool
                      from the left panel.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ask this note */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                  <MessageCircleQuestion className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold">
                    Ask This Note
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Ask questions using only your uploaded study material
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      void askQuestion();
                    }
                  }}
                  disabled={!noteText || asking}
                  placeholder="Example: Explain the main concept in this note..."
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40 disabled:opacity-40"
                />

                <button
                  onClick={() => void askQuestion()}
                  disabled={
                    !noteText ||
                    !question.trim() ||
                    asking
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {asking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Asking...
                    </>
                  ) : (
                    <>
                      <MessageCircleQuestion className="h-4 w-4" />
                      Ask AI
                    </>
                  )}
                </button>
              </div>

              {answer && (
                <div className="mt-4 rounded-2xl border border-cyan-400/10 bg-cyan-500/5 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      CampusMind Answer
                    </p>

                    <button
                      onClick={() => void copyResult(answer)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {answer}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

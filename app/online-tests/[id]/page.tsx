"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Flag,
  GraduationCap,
  Loader2,
  Send,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Option = {
  id: string;
  optionText: string;
  sortOrder: number;
};

type Question = {
  id: string;
  question: string;
  questionType: string;
  marks: number;
  sortOrder: number;
  options: Option[];
};

type TestData = {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startDate?: string | null;
  endDate?: string | null;
};

type Attempt = {
  id: string;
  startedAt: string;
  submittedAt?: string | null;
  score?: number | null;
  percentage?: number | null;
  passed?: boolean | null;
  status: string;
};

type TestResponse = {
  success: boolean;
  state?: string;
  message?: string;
  test?: TestData;
  attempt?: Attempt;
  questions?: Question[];
};

type Result = {
  id: string;
  score?: number | null;
  percentage?: number | null;
  passed?: boolean | null;
  status: string;
  submittedAt?: string | null;
};

export default function OnlineTestPage() {
  const params = useParams();
  const router = useRouter();

  const testId = String(params.id);

  const [test, setTest] = useState<TestData | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(0);

  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const remainingCount = Math.max(
    questions.length - answeredCount,
    0
  );

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }, [secondsLeft]);

  const loadTest = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/student/online-tests/${testId}`,
        {
          cache: "no-store",
        }
      );

      const data: TestResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load this test."
        );
      }

      if (data.state === "SUBMITTED" && data.attempt) {
        setTest(data.test || null);
        setAttempt(data.attempt);
        setResult({
          id: data.attempt.id,
          score: data.attempt.score,
          percentage: data.attempt.percentage,
          passed: data.attempt.passed,
          status: data.attempt.status,
          submittedAt: data.attempt.submittedAt,
        });
        setLoading(false);
        return;
      }

      setTest(data.test || null);
      setAttempt(data.attempt || null);
      setQuestions(data.questions || []);

      if (data.attempt?.startedAt && data.test?.duration) {
        const startedAt = new Date(
          data.attempt.startedAt
        ).getTime();

        const deadline =
          startedAt + data.test.duration * 60 * 1000;

        const remaining = Math.max(
          Math.floor((deadline - Date.now()) / 1000),
          0
        );

        setSecondsLeft(remaining);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this test."
      );
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const saveAnswer = async (
    questionId: string,
    optionId: string
  ) => {
    if (!attempt) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionId,
    }));

    try {
      setSaving(true);

      const response = await fetch(
        `/api/student/online-tests/${testId}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attemptId: attempt.id,
            questionId,
            optionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save answer."
        );
      }
    } catch (err) {
      console.error(err);

      setAnswers((previous) => {
        const next = { ...previous };
        delete next[questionId];
        return next;
      });
    } finally {
      setSaving(false);
    }
  };

  const submitTest = useCallback(async () => {
    if (!attempt || submitting) return;

    const confirmed = window.confirm(
      `Submit your test now?\n\nAnswered: ${answeredCount}/${questions.length}`
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/student/online-tests/${testId}/submit`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit test."
        );
      }

      setResult(data.result);
      setAttempt((previous) =>
        previous
          ? {
              ...previous,
              status: "SUBMITTED",
              submittedAt: data.result.submittedAt,
              score: data.result.score,
              percentage: data.result.percentage,
              passed: data.result.passed,
            }
          : previous
      );
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to submit test."
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    attempt,
    submitting,
    answeredCount,
    questions.length,
    testId,
  ]);

  useEffect(() => {
    if (!attempt || result || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);

          setTimeout(() => {
            submitTest();
          }, 0);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [attempt, result, secondsLeft, submitTest]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-blue-600"
            size={34}
          />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading examination...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={25} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Unable to open test
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <Link
            href="/online-tests"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to Tests
          </Link>
        </div>
      </main>
    );
  }

  if (result && test) {
    const percentage = Number(result.percentage || 0);
    const score = Number(result.score || 0);

    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-5 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <GraduationCap size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-950">
                CampusMind AI
              </p>

              <p className="text-xs text-slate-500">
                Examination Result
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-5 py-12">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div
              className={`p-8 text-center text-white ${
                result.passed
                  ? "bg-emerald-600"
                  : "bg-slate-900"
              }`}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                {result.passed ? (
                  <CheckCircle2 size={32} />
                ) : (
                  <Flag size={30} />
                )}
              </div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-white/70">
                Test Submitted
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                {result.passed ? "Congratulations!" : "Test Completed"}
              </h1>

              <p className="mt-2 text-sm text-white/80">
                {test.title}
              </p>
            </div>

            <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
              <ResultStat
                label="Score"
                value={`${score} / ${test.totalMarks}`}
              />

              <ResultStat
                label="Percentage"
                value={`${percentage.toFixed(1)}%`}
              />

              <ResultStat
                label="Status"
                value={result.passed ? "PASSED" : "NOT PASSED"}
              />
            </div>

            <div className="p-8">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Passing Requirement
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Minimum passing marks: {test.passingMarks}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/online-tests"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Back to Online Tests
                </Link>

                <Link
                  href="/dashboard"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!test || !attempt || questions.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <FileQuestion
              className="mx-auto text-slate-400"
              size={42}
            />

            <h1 className="mt-5 text-2xl font-bold text-slate-950">
              No questions available
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              This test does not currently contain any active questions.
            </p>

            <Link
              href="/online-tests"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              Back to Tests
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isDangerTime = secondsLeft <= 60;
  const isWarningTime = secondsLeft <= 300;

  return (
    <main className="min-h-screen bg-slate-100">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white sm:flex">
              <GraduationCap size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {test.title}
              </p>

              <p className="text-xs text-slate-500">
                Online Examination
              </p>
            </div>
          </div>

          <div
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-lg font-bold ${
              isDangerTime
                ? "bg-red-100 text-red-700"
                : isWarningTime
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-950 text-white"
            }`}
          >
            <Clock3 size={18} />
            {formattedTime}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* WARNING */}
        {isDangerTime && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertTriangle size={19} />
            Less than one minute remaining. Please submit your test.
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* QUESTION */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  Question {currentIndex + 1} of {questions.length}
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  {currentQuestion.marks}{" "}
                  {currentQuestion.marks === 1
                    ? "mark"
                    : "marks"}
                </span>
              </div>

              <h1 className="mt-7 text-xl font-bold leading-8 text-slate-950 sm:text-2xl">
                {currentQuestion.question}
              </h1>
            </div>

            <div className="p-6 sm:p-8">
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const selected =
                    answers[currentQuestion.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        saveAnswer(
                          currentQuestion.id,
                          option.id
                        )
                      }
                      className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span
                        className={`pt-1 text-sm font-semibold leading-6 ${
                          selected
                            ? "text-blue-900"
                            : "text-slate-700"
                        }`}
                      >
                        {option.optionText}
                      </span>

                      {selected && (
                        <CheckCircle2
                          className="ml-auto mt-1 shrink-0 text-blue-600"
                          size={19}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() =>
                    setCurrentIndex((value) =>
                      Math.max(value - 1, 0)
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={17} />
                  Previous
                </button>

                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                  {saving && (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Saving answer...
                    </>
                  )}
                </div>

                {currentIndex === questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={submitTest}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={17} />
                    )}

                    Submit Test
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((value) =>
                        Math.min(
                          value + 1,
                          questions.length - 1
                        )
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    Next
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Progress
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {answeredCount} / {questions.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${
                      questions.length
                        ? (answeredCount /
                            questions.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs font-medium text-slate-500">
                {remainingCount} question
                {remainingCount === 1 ? "" : "s"} remaining
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <FileQuestion
                  size={17}
                  className="text-slate-500"
                />

                <h2 className="text-sm font-bold text-slate-900">
                  Question Navigator
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const answered =
                    Boolean(answers[question.id]);

                  const active =
                    currentIndex === index;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() =>
                        setCurrentIndex(index)
                      }
                      className={`flex h-10 items-center justify-center rounded-xl text-xs font-bold transition ${
                        active
                          ? "bg-slate-950 text-white"
                          : answered
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-slate-950" />
                  Current
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-emerald-100" />
                  Answered
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-slate-100" />
                  Not answered
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Examination Rules
                  </p>

                  <ul className="mt-2 space-y-1.5 text-xs leading-5 text-amber-800">
                    <li>• Do not refresh the page unnecessarily.</li>
                    <li>• Your answers are saved automatically.</li>
                    <li>• Submit before the timer reaches zero.</li>
                  </ul>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ResultStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-6 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}
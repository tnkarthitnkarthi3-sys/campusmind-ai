"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  FileQuestion,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type Option = {
  id?: string;
  optionText: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  testId: string;
  question: string;
  type: string;
  marks: number;
  explanation: string | null;
  active: boolean;
  options: Option[];
};

type Test = {
  id: string;
  title: string;
  totalMarks: number;
  passingMarks: number;
  durationMin: number;
};

type FormState = {
  question: string;
  type: "MCQ" | "TRUE_FALSE";
  marks: string;
  explanation: string;
  active: boolean;
  options: Option[];
};

const defaultOptions = [
  { optionText: "", isCorrect: false },
  { optionText: "", isCorrect: false },
  { optionText: "", isCorrect: false },
  { optionText: "", isCorrect: false },
];

export default function OnlineTestQuestionsPage() {
  const params = useParams<{ id: string }>();
  const testId = params.id;

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    question: "",
    type: "MCQ",
    marks: "1",
    explanation: "",
    active: true,
    options: defaultOptions,
  });

  async function loadQuestions() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/online-tests/questions?testId=${testId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load questions."
        );
      }

      setQuestions(data.questions || []);

      const testResponse = await fetch(
        "/api/admin/online-tests",
        {
          cache: "no-store",
        }
      );

      const testData = await testResponse.json();

      const found = (testData.tests || []).find(
        (item: Test) => item.id === testId
      );

      setTest(found || null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load questions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (testId) {
      loadQuestions();
    }
  }, [testId]);

  const totalQuestionMarks = useMemo(
    () =>
      questions.reduce(
        (sum, question) =>
          sum + question.marks,
        0
      ),
    [questions]
  );

  function resetForm() {
    setForm({
      question: "",
      type: "MCQ",
      marks: "1",
      explanation: "",
      active: true,
      options: defaultOptions.map(
        (option) => ({ ...option })
      ),
    });

    setEditingId(null);
    setError("");
  }

  function openCreate() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(question: Question) {
    setEditingId(question.id);

    setForm({
      question: question.question,
      type:
        question.type === "TRUE_FALSE"
          ? "TRUE_FALSE"
          : "MCQ",
      marks: String(question.marks),
      explanation: question.explanation || "",
      active: question.active,
      options: question.options.map(
        (option) => ({
          id: option.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
        })
      ),
    });

    setError("");
    setModalOpen(true);
  }

  function updateOption(
    index: number,
    key: "optionText" | "isCorrect",
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      options: current.options.map(
        (option, optionIndex) => {
          if (optionIndex !== index) {
            return key === "isCorrect" && value
              ? {
                  ...option,
                  isCorrect: false,
                }
              : option;
          }

          return {
            ...option,
            [key]: value,
          };
        }
      ),
    }));
  }

  function addOption() {
    if (form.options.length >= 10) return;

    setForm((current) => ({
      ...current,
      options: [
        ...current.options,
        {
          optionText: "",
          isCorrect: false,
        },
      ],
    }));
  }

  function removeOption(index: number) {
    if (form.options.length <= 2) return;

    setForm((current) => ({
      ...current,
      options: current.options.filter(
        (_, optionIndex) =>
          optionIndex !== index
      ),
    }));
  }

  async function saveQuestion() {
    try {
      setSaving(true);
      setError("");

      const payload = {
        testId,
        question: form.question.trim(),
        type: form.type,
        marks: Number(form.marks),
        explanation:
          form.explanation.trim() || null,
        active: form.active,
        options: form.options.map(
          (option) => ({
            text: option.optionText.trim(),
            isCorrect: option.isCorrect,
          })
        ),
      };

      const response = await fetch(
        "/api/admin/online-tests/questions",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            ...(editingId
              ? { id: editingId }
              : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save question."
        );
      }

      setModalOpen(false);
      resetForm();

      await loadQuestions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save question."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(id: string) {
    if (
      !window.confirm(
        "Delete this question?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/online-tests/questions?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete question."
        );
      }

      await loadQuestions();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete question."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-7">
          <Link
            href="/admin/online-tests"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Online Tests
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-600 p-3 text-white">
                  <FileQuestion size={24} />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Question Manager
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    {test?.title ||
                      "Online Test"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Question
            </button>
          </div>
        </div>

        {test && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <InfoCard
              label="Questions"
              value={String(
                questions.length
              )}
            />

            <InfoCard
              label="Question Marks"
              value={`${totalQuestionMarks} / ${test.totalMarks}`}
            />

            <InfoCard
              label="Passing Marks"
              value={String(
                test.passingMarks
              )}
            />
          </div>
        )}

        {error && !modalOpen && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-500">
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FileQuestion size={26} />
              </div>

              <h2 className="font-bold text-slate-900">
                No questions yet
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add questions to make this online test ready.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Add First Question
              </button>
            </div>
          ) : (
            questions.map(
              (question, index) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                            {question.type}
                          </span>

                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            {question.marks} mark
                            {question.marks > 1
                              ? "s"
                              : ""}
                          </span>

                          {!question.active && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                              Inactive
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-base font-semibold leading-7 text-slate-900">
                          {question.question}
                        </h3>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {question.options.map(
                            (
                              option,
                              optionIndex
                            ) => (
                              <div
                                key={
                                  option.id ||
                                  optionIndex
                                }
                                className={`rounded-xl border px-3 py-2.5 text-sm ${
                                  option.isCorrect
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-slate-200 bg-slate-50 text-slate-700"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">
                                    {String.fromCharCode(
                                      65 +
                                        optionIndex
                                    )}
                                    .
                                  </span>

                                  <span className="flex-1">
                                    {
                                      option.optionText
                                    }
                                  </span>

                                  {option.isCorrect && (
                                    <CheckCircle2
                                      size={
                                        16
                                      }
                                    />
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() =>
                          openEdit(question)
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Edit3 size={17} />
                      </button>

                      <button
                        onClick={() =>
                          deleteQuestion(
                            question.id
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Question"
                    : "Add Question"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a graded question and its answer options.
                </p>
              </div>

              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Question
                </span>

                <textarea
                  rows={4}
                  value={form.question}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      question:
                        e.target.value,
                    })
                  }
                  placeholder="Enter the question..."
                  className={inputClass}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Type
                  </span>

                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target
                          .value as
                          | "MCQ"
                          | "TRUE_FALSE",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="MCQ">
                      Multiple Choice
                    </option>
                    <option value="TRUE_FALSE">
                      True / False
                    </option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Marks
                  </span>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.marks}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        marks: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </label>

                <label className="flex items-end">
                  <span className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          active:
                            e.target.checked,
                        })
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      Active
                    </span>
                  </span>
                </label>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Answer Options
                  </span>

                  <button
                    type="button"
                    onClick={addOption}
                    disabled={
                      form.options.length >=
                      10
                    }
                    className="text-sm font-semibold text-indigo-600 disabled:opacity-40"
                  >
                    + Add Option
                  </button>
                </div>

                <div className="space-y-3">
                  {form.options.map(
                    (option, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateOption(
                              index,
                              "isCorrect",
                              true
                            )
                          }
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
                            option.isCorrect
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                          title="Mark as correct"
                        >
                          {String.fromCharCode(
                            65 + index
                          )}
                        </button>

                        <input
                          value={
                            option.optionText
                          }
                          onChange={(e) =>
                            updateOption(
                              index,
                              "optionText",
                              e.target.value
                            )
                          }
                          placeholder={`Option ${String.fromCharCode(
                            65 + index
                          )}`}
                          className={inputClass}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeOption(
                              index
                            )
                          }
                          disabled={
                            form.options
                              .length <= 2
                          }
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>
                    )
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Click the A/B/C/D button to mark the correct answer.
                </p>
              </div>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Explanation
                </span>

                <textarea
                  rows={3}
                  value={form.explanation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      explanation:
                        e.target.value,
                    })
                  }
                  placeholder="Optional explanation shown after submission..."
                  className={inputClass}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={saveQuestion}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Question"
                  : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </div>
    </div>
  );
}
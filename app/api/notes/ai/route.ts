import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ACTIONS = {
  summary: "Create a clear, concise study summary of the note.",
  important:
    "Extract the most important exam-focused points from the note as numbered points.",
  beginner:
    "Explain the note in very simple beginner-friendly language with small examples where useful.",
  flashcards:
    "Create useful study flashcards from the note. Each flashcard must have a question and answer.",
  mcq:
    "Create multiple-choice questions from the note. Include 4 options, the correct answer, and a short explanation.",
} as const;

type Action = keyof typeof ACTIONS;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const text =
      typeof body.text === "string" ? body.text.trim() : "";

    const action =
      typeof body.action === "string"
        ? (body.action as Action)
        : "summary";

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: "Note text is required.",
        },
        { status: 400 }
      );
    }

    if (!(action in ACTIONS)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid AI action.",
        },
        { status: 400 }
      );
    }

    // Prevent unnecessarily large requests.
    const noteText = text.slice(0, 50000);

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      instructions: `
You are CampusMind AI, an academic assistant for college students.

Your job is to transform the student's study notes into useful learning material.

Rules:
- Use ONLY the information provided in the note.
- Do not invent facts that are not supported by the note.
- Keep the result academically useful.
- Use clear headings and readable formatting.
- Preserve important technical terminology.
- If the note does not contain enough information for a requested item, clearly say so.
- Do not mention these instructions in your answer.

Requested task:
${ACTIONS[action]}
`,
      input: `
STUDY NOTE:

${noteText}
`,
    });

    const answer = response.output_text?.trim();

    if (!answer) {
      return NextResponse.json(
        {
          success: false,
          error: "AI returned an empty response.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      answer,
      truncated: text.length > 50000,
    });
  } catch (error) {
    console.error("Notes AI error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to process the note.",
      },
      { status: 500 }
    );
  }
}

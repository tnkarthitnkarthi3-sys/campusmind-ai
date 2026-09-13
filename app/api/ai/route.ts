import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY;

const openai = apiKey
  ? new OpenAI({
      apiKey,
    })
  : null;

type Mode = "normal" | "beginner" | "exam" | "planner";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const CAMPUSMIND_SYSTEM_PROMPT = `
You are CampusMind AI, a professional AI academic assistant for college students.

Your responsibilities:
- Answer academic questions.
- Explain difficult concepts clearly.
- Help students prepare for exams.
- Help with assignments.
- Help create study plans.
- Explain notes and study materials.
- Help students manage academic productivity.
- Give practical and realistic suggestions.

Rules:
1. Never invent student-specific information.
2. If student data is not provided, do not pretend that you know it.
3. Use simple language when possible.
4. Use headings, bullets and numbered steps when useful.
5. Give examples when they improve understanding.
6. For technical questions, explain step-by-step.
7. For exam questions, highlight important points.
8. Do not unnecessarily repeat the student's question.
9. Be concise but useful.
10. Act as CampusMind AI, a student success assistant.
`;

function getModeInstruction(mode: Mode) {
  switch (mode) {
    case "beginner":
      return `
MODE: BEGINNER

Explain everything from the basics.
Assume the student has little or no prior knowledge.
Use simple words, small examples and step-by-step explanations.
Avoid unnecessary advanced terminology.
`;

    case "exam":
      return `
MODE: EXAM PREPARATION

Focus on exam success.
Give:
- Important concepts
- Key points
- Short explanations
- Memory tricks when useful
- Common mistakes
- Possible exam questions when appropriate
- Quick revision strategy
`;

    case "planner":
      return `
MODE: STUDY PLANNER

Act as an academic planning assistant.
Create realistic actionable study plans.
Prioritize:
1. Upcoming exams
2. Weak subjects
3. Pending assignments
4. Important deadlines
5. Revision
6. Breaks and realistic study time

Do not create impossible schedules.
`;

    default:
      return `
MODE: NORMAL

Answer naturally as a helpful academic assistant.
`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = String(body.message || "").trim();

    const mode: Mode =
      body.mode === "beginner" ||
      body.mode === "exam" ||
      body.mode === "planner"
        ? body.mode
        : "normal";

    const subject = body.subject
      ? String(body.subject).trim()
      : "";

    const incomingMessages = Array.isArray(body.messages)
      ? body.messages
      : [];

    if (!message && incomingMessages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a question.",
        },
        { status: 400 }
      );
    }

    if (!openai) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OpenAI is not configured. Please add OPENAI_API_KEY to .env and restart the server.",
        },
        { status: 503 }
      );
    }

    const history: ChatMessage[] = incomingMessages
      .filter(
        (item: ChatMessage) =>
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
      )
      .slice(-12)
      .map((item: ChatMessage) => ({
        role: item.role,
        content: item.content.slice(0, 10000),
      }));

    if (message) {
      history.push({
        role: "user",
        content: message,
      });
    }

    const subjectInstruction = subject
      ? `\nCurrent subject: ${subject}\n`
      : "";

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      instructions: `
${CAMPUSMIND_SYSTEM_PROMPT}

${getModeInstruction(mode)}

${subjectInstruction}
`,
      input: history.map((item) => ({
        role: item.role,
        content: [
          {
            type: "input_text",
            text: item.content,
          },
        ],
      })),
      max_output_tokens: 1600,
    });

    const answer = response.output_text?.trim();

    if (!answer) {
      return NextResponse.json(
        {
          success: false,
          message: "CampusMind AI could not generate a response.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      answer,
      mode,
      subject: subject || null,
    });
  } catch (error) {
    console.error("CampusMind AI error:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.status === 401
              ? "Invalid OpenAI API key. Check OPENAI_API_KEY in .env."
              : error.message || "OpenAI request failed.",
        },
        {
          status: error.status || 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "CampusMind AI server error.",
      },
      { status: 500 }
    );
  }
}
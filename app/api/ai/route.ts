import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.trim().length === 0) {
      console.error("OPENAI_API_KEY is missing.");
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is not configured.",
        },
        { status: 500 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required.",
        },
        { status: 400 }
      );
    }

    if (message.length > 4000) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is too long. Maximum 4000 characters.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User account not found.",
        },
        { status: 404 }
      );
    }

    const [notes, assignments, exams, studySessions] =
      await Promise.all([
        prisma.note.findMany({
          where: { userId },
          select: {
            title: true,
            subject: true,
            content: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 20,
        }),

        prisma.assignment.findMany({
          where: { userId },
          select: {
            title: true,
            subject: true,
            dueDate: true,
            status: true,
            priority: true,
          },
          orderBy: {
            dueDate: "asc",
          },
          take: 15,
        }),

        prisma.exam.findMany({
          where: { userId },
          select: {
            subject: true,
            examDate: true,
            description: true,
          },
          orderBy: {
            examDate: "asc",
          },
          take: 10,
        }),

        prisma.studySession.findMany({
          where: { userId },
          select: {
            title: true,
            startTime: true,
            endTime: true,
            completed: true,
          },
          orderBy: {
            startTime: "desc",
          },
          take: 15,
        }),
      ]);

    const academicContext = `
STUDENT
Name: ${user.name}
Email: ${user.email}

SAVED NOTES
${
  notes.length > 0
    ? notes
        .map(
          (note) =>
            `Title: ${note.title}
Subject: ${note.subject}
Content: ${note.content}`
        )
        .join("\n\n")
    : "No saved notes."
}

ASSIGNMENTS
${
  assignments.length > 0
    ? assignments
        .map(
          (item) =>
            `Title: ${item.title}
Subject: ${item.subject}
Due: ${item.dueDate.toISOString()}
Status: ${item.status}
Priority: ${item.priority}`
        )
        .join("\n\n")
    : "No assignments."
}

EXAMS
${
  exams.length > 0
    ? exams
        .map(
          (exam) =>
            `Subject: ${exam.subject}
Date: ${exam.examDate.toISOString()}
Description: ${exam.description || "None"}`
        )
        .join("\n\n")
    : "No exams."
}

STUDY SESSIONS
${
  studySessions.length > 0
    ? studySessions
        .map(
          (session) =>
            `Title: ${session.title}
Start: ${session.startTime.toISOString()}
End: ${session.endTime.toISOString()}
Completed: ${session.completed}`
        )
        .join("\n\n")
    : "No study sessions."
}
`;

    const openai = new OpenAI({
      apiKey,
    });

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      instructions: `
You are CampusMind AI, a professional academic assistant for college students.

Student name:
${user.name}

Your job:
- Answer academic questions clearly.
- Explain Computer Science concepts step by step.
- Help with programming.
- Summarize saved notes.
- Generate quizzes.
- Help prepare for exams.
- Create practical revision plans.
- Use the student's actual CampusMind data when relevant.
- If the user asks about tomorrow's exams, assignments, or study sessions, inspect the supplied academic context.
- Never invent an exam, assignment, note, or study session.
- If there is no matching data, clearly say that no matching item was found.
- Keep answers useful and reasonably concise.
- Use headings and bullet points when helpful.
- Never reveal API keys, passwords, cookies, database credentials, or internal system details.

ACADEMIC CONTEXT
${academicContext}
`,

      input: message,
    });

    const answer = response.output_text?.trim();

    if (!answer) {
      console.error("OpenAI returned no output text.");

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
      answer,
    });
  } catch (error: unknown) {
    console.error("====================================");
    console.error("CampusMind AI API Error");
    console.error("====================================");

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }

    return NextResponse.json(
      {
        success: false,
        error: "AI service is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}

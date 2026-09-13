import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

    const subjects = Array.isArray(body.subjects) ? body.subjects : [];
    const assignments = Array.isArray(body.assignments)
      ? body.assignments
      : [];
    const exams = Array.isArray(body.exams) ? body.exams : [];

    const studyHours =
      typeof body.studyHours === "number" ? body.studyHours : 0;

    const weeklyGoalHours =
      typeof body.weeklyGoalHours === "number"
        ? body.weeklyGoalHours
        : 20;

    if (subjects.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No subject data available.",
        },
        { status: 400 }
      );
    }

    const weakSubjects = [...subjects]
      .filter((subject) => Number(subject.percentage) < 85)
      .sort(
        (a, b) =>
          Number(a.percentage) - Number(b.percentage)
      );

    const strongSubjects = [...subjects]
      .filter((subject) => Number(subject.percentage) >= 85)
      .sort(
        (a, b) =>
          Number(b.percentage) - Number(a.percentage)
      );

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      instructions: `
You are CampusMind AI's Weak Subject Coach.

Create a practical academic improvement plan using ONLY the supplied student data.

Rules:
- Never invent marks, subjects, assignments, exams, or attendance.
- Below 75% = HIGH RISK.
- 75% to 84% = NEEDS ATTENTION.
- 85% or above = STABLE.
- Consider upcoming exams and assignments.
- Keep the study plan realistic based on the student's current weekly study hours.
- If topic-level information is unavailable, do not invent exact topics.
- You may connect an assignment title to its subject because that information is supplied.
- Mention attendance separately.
- Return clean Markdown.

Required sections:

# Weak Subject Analysis
# Priority Ranking
# 7-Day Improvement Plan
# Daily Study Recommendation
# Exam & Assignment Connection
# Attendance Warning
# Expected Improvement
# Coach Motivation
`,
      input: `
Student subjects:
${JSON.stringify(subjects, null, 2)}

Weak subjects:
${JSON.stringify(weakSubjects, null, 2)}

Strong subjects:
${JSON.stringify(strongSubjects, null, 2)}

Assignments:
${JSON.stringify(assignments, null, 2)}

Upcoming exams:
${JSON.stringify(exams, null, 2)}

Current weekly study hours:
${studyHours}

Weekly study goal:
${weeklyGoalHours}

Generate the personalized CampusMind AI Weak Subject Coach plan.
`,
      max_output_tokens: 1800,
    });

    const answer =
      response.output_text?.trim() ||
      "Unable to generate the coaching plan.";

    return NextResponse.json({
      success: true,
      answer,
      weakSubjects,
      strongSubjects,
    });
  } catch (error) {
    console.error("Weak Subject Coach API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate the AI coaching plan.",
      },
      { status: 500 }
    );
  }
}

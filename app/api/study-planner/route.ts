import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      attendance = [],
      assignments = [],
      exams = [],
      subjects = [],
      studyHours = 0,
    } = body;

    const prompt = `
You are CampusMind AI, an intelligent academic study planner.

Create a practical personalized study plan using ONLY the academic data provided below.

Attendance:
${JSON.stringify(attendance)}

Assignments:
${JSON.stringify(assignments)}

Exams:
${JSON.stringify(exams)}

Subjects:
${JSON.stringify(subjects)}

Current weekly study hours:
${studyHours}

Return a concise but useful plan containing:
1. Today's priority
2. Subjects to study
3. Assignment priorities
4. Exam preparation
5. Recommended study duration
6. A simple morning/afternoon/evening schedule
7. One motivational tip

Do not invent specific academic facts that are not present in the supplied data.
`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      instructions:
        "You are CampusMind AI. Give clear, student-friendly academic planning advice.",
      input: prompt,
    });

    return NextResponse.json({
      success: true,
      plan: response.output_text,
    });
  } catch (error) {
    console.error("Study planner AI error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate the AI study plan.",
      },
      { status: 500 }
    );
  }
}

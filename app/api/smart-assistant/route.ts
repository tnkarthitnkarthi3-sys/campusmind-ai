import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a question.",
        },
        { status: 400 }
      );
    }

    const [assignments, exams, timetable, departments, faculty] =
      await Promise.all([
        prisma.assignment.findMany({
          where: {
            userId: user.id,
            status: {
              not: "COMPLETED",
            },
          },
          orderBy: {
            dueDate: "asc",
          },
          take: 10,
        }),

        prisma.exam.findMany({
          where: {
            userId: user.id,
            examDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            examDate: "asc",
          },
          take: 10,
        }),

        prisma.campusTimetable.findMany({
          where: {
            active: true,
            ...(user.courseId
              ? {
                  courseId: user.courseId,
                }
              : {}),
            ...(user.semesterId
              ? {
                  semesterId: user.semesterId,
                }
              : {}),
          },
          include: {
            subject: {
              select: {
                name: true,
                code: true,
              },
            },
            faculty: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: [
            {
              day: "asc",
            },
            {
              startTime: "asc",
            },
          ],
          take: 30,
        }),

        prisma.department.findMany({
          where: {
            active: true,
          },
          select: {
            name: true,
            code: true,
            description: true,
          },
          orderBy: {
            name: "asc",
          },
        }),

        prisma.user.findMany({
          where: {
            role: "FACULTY",
          },
          select: {
            name: true,
            email: true,
            department: {
              select: {
                name: true,
                code: true,
              },
            },
            facultySubjects: {
              select: {
                subject: {
                  select: {
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
          orderBy: {
            name: "asc",
          },
          take: 50,
        }),
      ]);

    const context = {
      student: {
        name: user.name,
        email: user.email,
      },

      assignments: assignments.map((item) => ({
        title: item.title,
        subject: item.subject,
        dueDate: item.dueDate,
        priority: item.priority,
        status: item.status,
      })),

      exams: exams.map((item) => ({
        subject: item.subject,
        examDate: item.examDate,
        description: item.description,
      })),

      timetable: timetable.map((item) => ({
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
        room: item.room,
        subject: item.subject,
        faculty: item.faculty,
      })),

      departments,

      faculty: faculty.map((member) => ({
        name: member.name,
        email: member.email,
        department: member.department,
        subjects: member.facultySubjects.map(
          (item) => item.subject
        ),
      })),
    };

    const apiKey =
      process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        mode: "smart",
        answer: generateSmartAnswer(
          message,
          context
        ),
      });
    }

    try {
      const aiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model:
              process.env.OPENAI_MODEL ||
              "gpt-4o-mini",

            temperature: 0.4,

            messages: [
              {
                role: "system",
                content: `
You are CampusMind AI, a smart college assistant.

Your job is to help students with:
- attendance
- timetable
- assignments
- exams
- study planning
- departments
- faculty
- subjects
- academic questions

Use the supplied campus data when answering personal campus questions.

Rules:
1. Be concise and useful.
2. Never invent campus information.
3. If information is missing, clearly say that.
4. Use simple student-friendly language.
5. Give actionable suggestions.
6. For academic questions, explain concepts clearly.
7. Do not expose internal database details.
8. Address the student naturally.
9. Prefer bullet points when useful.
10. You are CampusMind AI.
                `.trim(),
              },

              {
                role: "user",
                content: `
STUDENT CAMPUS DATA:

${JSON.stringify(context, null, 2)}

STUDENT QUESTION:

${message}
                `.trim(),
              },
            ],
          }),
        }
      );

      if (!aiResponse.ok) {
        console.error(
          "OpenAI API returned:",
          aiResponse.status
        );

        return NextResponse.json({
          success: true,
          mode: "smart",
          answer: generateSmartAnswer(
            message,
            context
          ),
        });
      }

      const result = await aiResponse.json();

      const answer =
        result?.choices?.[0]?.message?.content;

      if (!answer) {
        return NextResponse.json({
          success: true,
          mode: "smart",
          answer: generateSmartAnswer(
            message,
            context
          ),
        });
      }

      return NextResponse.json({
        success: true,
        mode: "ai",
        answer,
      });
    } catch (aiError) {
      console.error(
        "AI SERVICE ERROR:",
        aiError
      );

      return NextResponse.json({
        success: true,
        mode: "smart",
        answer: generateSmartAnswer(
          message,
          context
        ),
      });
    }
  } catch (error) {
    console.error(
      "SMART ASSISTANT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "CampusMind Assistant could not process your request.",
      },
      { status: 500 }
    );
  }
}

function generateSmartAnswer(
  message: string,
  context: any
) {
  const question = message.toLowerCase();

  if (
    question.includes("assignment") ||
    question.includes("homework")
  ) {
    if (!context.assignments.length) {
      return `You currently have no pending assignments in CampusMind AI. 🎉`;
    }

    const list = context.assignments
      .slice(0, 5)
      .map(
        (item: any, index: number) =>
          `${index + 1}. ${item.title} — ${item.subject} — due ${formatDate(item.dueDate)}`
      )
      .join("\n");

    return `Here are your pending assignments:\n\n${list}\n\nFocus on the earliest deadline first.`;
  }

  if (
    question.includes("exam") ||
    question.includes("test")
  ) {
    if (!context.exams.length) {
      return `You don't have any upcoming exams recorded right now.`;
    }

    const list = context.exams
      .slice(0, 5)
      .map(
        (item: any, index: number) =>
          `${index + 1}. ${item.subject} — ${formatDate(item.examDate)}`
      )
      .join("\n");

    return `Your upcoming exams:\n\n${list}\n\nStart with the subject having the nearest exam date.`;
  }

  if (
    question.includes("timetable") ||
    question.includes("schedule") ||
    question.includes("class")
  ) {
    if (!context.timetable.length) {
      return `I couldn't find timetable entries for your current course/semester.`;
    }

    const list = context.timetable
      .slice(0, 8)
      .map(
        (item: any) =>
          `• ${item.day} — ${item.subject?.name || "Subject"} (${item.startTime}–${item.endTime})`
      )
      .join("\n");

    return `Here are some timetable entries:\n\n${list}`;
  }

  if (
    question.includes("faculty") ||
    question.includes("teacher") ||
    question.includes("professor")
  ) {
    if (!context.faculty.length) {
      return `No faculty information is currently available.`;
    }

    const list = context.faculty
      .slice(0, 8)
      .map(
        (member: any) =>
          `• ${member.name} — ${member.department?.code || "Department"}`
      )
      .join("\n");

    return `Here are the faculty members available in CampusMind:\n\n${list}`;
  }

  if (
    question.includes("department") ||
    question.includes("branch")
  ) {
    if (!context.departments.length) {
      return `No department information is currently available.`;
    }

    const list = context.departments
      .map(
        (department: any) =>
          `• ${department.code} — ${department.name}`
      )
      .join("\n");

    return `Campus departments:\n\n${list}`;
  }

  if (
    question.includes("hello") ||
    question.includes("hi") ||
    question.includes("hey")
  ) {
    return `Hey ${context.student.name}! 👋\n\nI'm CampusMind AI, your smart college assistant.\n\nYou can ask me about your timetable, assignments, exams, faculty, departments, study planning, or academic questions.`;
  }

  return `Hi ${context.student.name}! 👋\n\nI can help you with your college information, timetable, assignments, exams, faculty and study planning.\n\nTry asking:\n• "What assignments do I have?"\n• "When is my next exam?"\n• "Show my timetable"\n• "Who are the CSE faculty?"\n• "Show departments"`;
}

function formatDate(date: string | Date) {
  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(date));
  } catch {
    return String(date);
  }
}

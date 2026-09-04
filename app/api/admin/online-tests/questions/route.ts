import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

const optionSchema = z.object({
  text: z.string().min(1).max(1000),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  testId: z.string().min(1),
  question: z.string().min(2).max(5000),
  type: z.enum(["MCQ", "TRUE_FALSE"]),
  marks: z.number().int().min(1).max(100),
  explanation: z.string().max(2000).optional().nullable(),
  active: z.boolean().default(true),
  options: z.array(optionSchema).min(2).max(10),
});

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return NextResponse.json(
        { error: "Test ID is required." },
        { status: 400 }
      );
    }

    const questions =
      await prisma.campusTestQuestion.findMany({
        where: { testId },
        orderBy: [
          { createdAt: "asc" },
          { createdAt: "asc" },
        ],
      });

    const questionIds = questions.map((q) => q.id);

    const options = questionIds.length
      ? await prisma.campusTestOption.findMany({
          where: {
            questionId: {
              in: questionIds,
            },
          },
        })
      : [];

    return NextResponse.json({
      questions: questions.map((question) => ({
        ...question,
        options: options.filter(
          (option) =>
            option.questionId === question.id
        ),
      })),
    });
  } catch (error) {
    console.error("QUESTIONS GET ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load questions." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = questionSchema.parse(await request.json());

    const test = await prisma.campusOnlineTest.findUnique({
      where: { id: body.testId },
    });

    if (!test) {
      return NextResponse.json(
        { error: "Online test not found." },
        { status: 404 }
      );
    }

    const correctCount = body.options.filter(
      (option) => option.isCorrect
    ).length;

    if (body.type === "MCQ" && correctCount !== 1) {
      return NextResponse.json(
        {
          error:
            "MCQ questions must have exactly one correct answer.",
        },
        { status: 400 }
      );
    }

    if (
      body.type === "TRUE_FALSE" &&
      correctCount !== 1
    ) {
      return NextResponse.json(
        {
          error:
            "True/False questions must have exactly one correct answer.",
        },
        { status: 400 }
      );
    }

    const count =
      await prisma.campusTestQuestion.count({
        where: { testId: body.testId },
      });

    const question =
      await prisma.campusTestQuestion.create({
        data: {
          testId: body.testId,
          question: body.question.trim(),
          marks: body.marks,
          explanation:
            body.explanation?.trim() || null,
          active: body.active,

        },
      });

    await prisma.campusTestOption.createMany({
      data: body.options.map((option, index) => ({
        questionId: question.id,
        optionText: option.text.trim(),
        isCorrect: option.isCorrect,
      })),
    });

    return NextResponse.json(
      {
        success: true,
        question,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("QUESTION POST ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message ||
            "Invalid question data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create question." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = questionSchema.parse(await request.json());

    const questionId = String(
      (await request.clone().json()).id || ""
    );

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required." },
        { status: 400 }
      );
    }

    const existing =
      await prisma.campusTestQuestion.findUnique({
        where: { id: questionId },
      });

    if (!existing) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    const correctCount = body.options.filter(
      (option) => option.isCorrect
    ).length;

    if (correctCount !== 1) {
      return NextResponse.json(
        {
          error:
            "Question must have exactly one correct answer.",
        },
        { status: 400 }
      );
    }

    const question =
      await prisma.campusTestQuestion.update({
        where: { id: questionId },
        data: {
          testId: body.testId,
          question: body.question.trim(),
          marks: body.marks,
          explanation:
            body.explanation?.trim() || null,
          active: body.active,
        },
      });

    await prisma.campusTestOption.deleteMany({
      where: {
        questionId,
      },
    });

    await prisma.campusTestOption.createMany({
      data: body.options.map((option, index) => ({
        questionId,
        optionText: option.text.trim(),
        isCorrect: option.isCorrect,
      })),
    });

    return NextResponse.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("QUESTION PUT ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message ||
            "Invalid question data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update question." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Question ID is required." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.campusTestAnswer.deleteMany({
        where: { questionId: id },
      }),

      prisma.campusTestOption.deleteMany({
        where: { questionId: id },
      }),

      prisma.campusTestQuestion.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("QUESTION DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete question." },
      { status: 500 }
    );
  }
}
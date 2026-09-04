import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const answerSchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  optionId: z.string().nullable().optional(),
  answerText: z.string().nullable().optional(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const student = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Student access required",
        },
        { status: 403 }
      );
    }

    const { id: testId } = await context.params;

    const body = await request.json();
    const parsed = answerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid answer data",
        },
        { status: 400 }
      );
    }

    const {
      attemptId,
      questionId,
      optionId,
      answerText,
    } = parsed.data;

    const attempt =
      await prisma.campusTestAttempt.findFirst({
        where: {
          id: attemptId,
          testId,
          studentId: student.id,
          status: "IN_PROGRESS",
        },
      });

    if (!attempt) {
      return NextResponse.json(
        {
          success: false,
          message: "Active test attempt not found",
        },
        { status: 404 }
      );
    }

    const question =
      await prisma.campusTestQuestion.findFirst({
        where: {
          id: questionId,
          testId,
          active: true,
        },
        select: {
          id: true,
          questionType: true,
          marks: true,
        },
      });

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question not found",
        },
        { status: 404 }
      );
    }

    if (optionId) {
      const option =
        await prisma.campusTestOption.findFirst({
          where: {
            id: optionId,
            questionId,
          },
          select: {
            id: true,
            isCorrect: true,
          },
        });

      if (!option) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid option",
          },
          { status: 400 }
        );
      }

      const marks = option.isCorrect
        ? question.marks
        : 0;

      await prisma.campusTestAnswer.upsert({
        where: {
          id:
            (
              await prisma.campusTestAnswer.findFirst({
                where: {
                  attemptId,
                  questionId,
                },
                select: {
                  id: true,
                },
              })
            )?.id || "missing-answer-id",
        },
        update: {
          optionId: option.id,
          answerText: null,
          marks,
          isCorrect: option.isCorrect,
        },
        create: {
          attemptId,
          questionId,
          optionId: option.id,
          answerText: null,
          marks,
          isCorrect: option.isCorrect,
        },
      });
    } else {
      const existing =
        await prisma.campusTestAnswer.findFirst({
          where: {
            attemptId,
            questionId,
          },
          select: {
            id: true,
          },
        });

      if (existing) {
        await prisma.campusTestAnswer.update({
          where: {
            id: existing.id,
          },
          data: {
            optionId: null,
            answerText: answerText || null,
            marks: 0,
            isCorrect: null,
          },
        });
      } else {
        await prisma.campusTestAnswer.create({
          data: {
            attemptId,
            questionId,
            optionId: null,
            answerText: answerText || null,
            marks: 0,
            isCorrect: null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Answer saved",
    });
  } catch (error) {
    console.error("Student online test answer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save answer",
      },
      { status: 500 }
    );
  }
}
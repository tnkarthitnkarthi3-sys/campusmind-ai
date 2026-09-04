import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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

    const attempt =
      await prisma.campusTestAttempt.findFirst({
        where: {
          testId,
          studentId: student.id,
          status: "IN_PROGRESS",
        },
        include: {
          test: {
            select: {
              totalMarks: true,
              passingMarks: true,
            },
          },
          answers: {
            select: {
              marks: true,
            },
          },
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

    const score = attempt.answers.reduce(
      (total, answer) => total + answer.marks,
      0
    );

    const percentage =
      attempt.test.totalMarks > 0
        ? (score / attempt.test.totalMarks) * 100
        : 0;

    const passed =
      score >= attempt.test.passingMarks;

    const updatedAttempt =
      await prisma.campusTestAttempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          submittedAt: new Date(),
          score,
          percentage,
          passed,
          status: "SUBMITTED",
        },
        select: {
          id: true,
          score: true,
          percentage: true,
          passed: true,
          status: true,
          submittedAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Test submitted successfully",
      result: updatedAttempt,
    });
  } catch (error) {
    console.error("Student online test submit error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit test",
      },
      { status: 500 }
    );
  }
}
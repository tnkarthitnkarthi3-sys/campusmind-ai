import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
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
        departmentId: true,
        courseId: true,
        semesterId: true,
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

    if (
      !student.departmentId ||
      !student.courseId ||
      !student.semesterId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Academic profile is incomplete",
        },
        { status: 400 }
      );
    }

    const { id } = await context.params;

    const test = await prisma.campusOnlineTest.findFirst({
      where: {
        id,
        departmentId: student.departmentId,
        courseId: student.courseId,
        semesterId: student.semesterId,
        active: true,
      },
      include: {
        questions: {
          where: {
            active: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            question: true,
            questionType: true,
            marks: true,
            sortOrder: true,
            options: {
              orderBy: {
                sortOrder: "asc",
              },
              select: {
                id: true,
                optionText: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json(
        {
          success: false,
          message: "Online test not found",
        },
        { status: 404 }
      );
    }

    const now = new Date();

    if (test.startDate && now < test.startDate) {
      return NextResponse.json(
        {
          success: false,
          message: "This test has not started yet",
          state: "UPCOMING",
        },
        { status: 403 }
      );
    }

    if (test.endDate && now > test.endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "This test is closed",
          state: "CLOSED",
        },
        { status: 403 }
      );
    }

    const existingAttempt =
      await prisma.campusTestAttempt.findUnique({
        where: {
          testId_studentId: {
            testId: test.id,
            studentId: student.id,
          },
        },
        select: {
          id: true,
          startedAt: true,
          submittedAt: true,
          score: true,
          percentage: true,
          passed: true,
          status: true,
        },
      });

    if (
      existingAttempt &&
      existingAttempt.status === "SUBMITTED"
    ) {
      return NextResponse.json({
        success: true,
        state: "SUBMITTED",
        test: {
          id: test.id,
          title: test.title,
          description: test.description,
          instructions: test.instructions,
          duration: test.duration,
          totalMarks: test.totalMarks,
          passingMarks: test.passingMarks,
          startDate: test.startDate,
          endDate: test.endDate,
        },
        attempt: existingAttempt,
        questions: [],
      });
    }

    let attempt = existingAttempt;

    if (!attempt) {
      attempt = await prisma.campusTestAttempt.create({
        data: {
          testId: test.id,
          studentId: student.id,
          status: "IN_PROGRESS",
        },
        select: {
          id: true,
          startedAt: true,
          submittedAt: true,
          score: true,
          percentage: true,
          passed: true,
          status: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      state: "IN_PROGRESS",
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        instructions: test.instructions,
        duration: test.duration,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        startDate: test.startDate,
        endDate: test.endDate,
      },
      attempt,
      questions: test.questions,
    });
  } catch (error) {
    console.error("Student online test GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load online test",
      },
      { status: 500 }
    );
  }
}
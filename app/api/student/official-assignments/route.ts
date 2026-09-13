import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        departmentId: true,
        courseId: true,
        semesterId: true,
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, message: "Student access required" },
        { status: 403 }
      );
    }

    if (
      !student.departmentId ||
      !student.courseId ||
      !student.semesterId
    ) {
      return NextResponse.json({
        success: true,
        assignments: [],
      });
    }

    const assignments =
      await prisma.campusAcademicAssignment.findMany({
        where: {
          departmentId: student.departmentId,
          courseId: student.courseId,
          semesterId: student.semesterId,
          active: true,
          status: "PUBLISHED",
        },
        orderBy: {
          dueDate: "asc",
        },
        include: {
          assignmentSubmissions: {
            where: {
              studentId: userId,
            },
            select: {
              id: true,
              status: true,
              submissionUrl: true,
              fileName: true,
              fileType: true,
              fileSize: true,
              submittedAt: true,
              updatedAt: true,
              marks: true,
              feedback: true,
              gradedAt: true,
              attemptNumber: true,
            },
          },
        },
      });

    const now = new Date();

    const enrichedAssignments = assignments.map((assignment) => {
      const submission = assignment.assignmentSubmissions[0] ?? null;

      let computedStatus = "PENDING";

      if (submission) {
        computedStatus = submission.status;
      } else if (new Date(assignment.dueDate) < now) {
        computedStatus = "OVERDUE";
      }

      return {
        ...assignment,
        submissions: undefined,
        submission,
        studentStatus: computedStatus,
        isOverdue:
          !submission &&
          new Date(assignment.dueDate) < now,
      };
    });

    return NextResponse.json({
      success: true,
      assignments: enrichedAssignments,
    });
  } catch (error) {
    console.error(
      "Official assignments API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load official assignments",
      },
      { status: 500 }
    );
  }
}
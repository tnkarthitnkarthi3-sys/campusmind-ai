import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const userId =
      cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        {
          status: 401,
        }
      );
    }

    const faculty =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          role: true,
        },
      });

    if (!faculty || faculty.role !== "FACULTY") {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty access required",
        },
        {
          status: 403,
        }
      );
    }

    const assignments =
      await prisma.subjectFaculty.findMany({
        where: {
          facultyId: faculty.id,
        },

        include: {
          subject: {
            include: {
              course: {
                include: {
                  department: true,
                },
              },

              semester: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,

      subjects: assignments.map(
        (assignment) => ({
          assignmentId: assignment.id,

          subject: assignment.subject,

          course: assignment.subject.course,

          department:
            assignment.subject.course.department,

          semester:
            assignment.subject.semester,
        })
      ),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load faculty subjects",
      },
      {
        status: 500,
      }
    );
  }
}
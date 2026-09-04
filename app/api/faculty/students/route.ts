import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest
) {
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
          departmentId: true,
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

    const subjectId =
      request.nextUrl.searchParams.get(
        "subjectId"
      );

    if (!faculty.departmentId) {
      return NextResponse.json({
        success: true,
        students: [],
      });
    }

    const assigned =
      subjectId
        ? await prisma.subjectFaculty.findFirst({
            where: {
              facultyId: faculty.id,
              subjectId,
            },

            include: {
              subject: true,
            },
          })
        : null;

    if (subjectId && !assigned) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This subject is not assigned to you",
        },
        {
          status: 403,
        }
      );
    }

    const students =
      await prisma.user.findMany({
        where: {
          role: "STUDENT",

          departmentId:
            faculty.departmentId,

          ...(assigned?.subject
            ? {
                courseId:
                  assigned.subject.courseId,

                semesterId:
                  assigned.subject.semesterId,
              }
            : {}),
        },

        select: {
          id: true,
          name: true,
          email: true,
          courseId: true,
          semesterId: true,
        },

        orderBy: {
          name: "asc",
        },
      });

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load students",
      },
      {
        status: 500,
      }
    );
  }
}
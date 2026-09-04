import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getFaculty() {
  const cookieStore = await cookies();

  const userId =
    cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      department: true,
      facultySubjects: {
        include: {
          subject: {
            include: {
              course: true,
              semester: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.role !== "FACULTY") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const faculty = await getFaculty();

    if (!faculty) {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty authentication required",
        },
        {
          status: 401,
        }
      );
    }

    const subjectIds =
      faculty.facultySubjects.map(
        (item) => item.subjectId
      );

    const [
      timetable,
      exams,
      assignments,
    ] = await Promise.all([
      prisma.campusTimetable.findMany({
        where: {
          facultyId: faculty.id,
          active: true,
        },

        orderBy: [
          {
            day: "asc",
          },
          {
            startTime: "asc",
          },
        ],

        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          semester: {
            select: {
              id: true,
              name: true,
              number: true,
            },
          },
        },
      }),

      prisma.campusAcademicExam.findMany({
        where: {
          subjectId: {
            in: subjectIds.length
              ? subjectIds
              : ["__NO_SUBJECT__"],
          },

          active: true,
        },

        orderBy: {
          examDate: "asc",
        },
      }),

      prisma.campusAcademicAssignment.findMany({
        where: {
          subjectId: {
            in: subjectIds.length
              ? subjectIds
              : ["__NO_SUBJECT__"],
          },

          active: true,
        },

        orderBy: {
          dueDate: "asc",
        },
      }),
    ]);


    const studentList =
      faculty.departmentId
        ? await prisma.user.findMany({
            where: {
              role: "STUDENT",
              departmentId: faculty.departmentId,
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
          })
        : [];

    return NextResponse.json({
      success: true,

      faculty: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
      },

      subjects: faculty.facultySubjects.map(
        (item) => ({
          id: item.subject.id,
          name: item.subject.name,
          code: item.subject.code,
          credits: item.subject.credits,

          course: item.subject.course,

          semester: item.subject.semester,
        })
      ),

      timetable,

      exams,

      assignments,

      students: studentList,
    });
  } catch (error) {
    console.error(
      "Faculty academic API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load faculty academic data",
      },
      {
        status: 500,
      }
    );
  }
}
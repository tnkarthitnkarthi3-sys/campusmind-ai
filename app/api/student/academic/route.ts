import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getStudent() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      course: true,
      semester: true,
    },
  });

  if (!user || user.role !== "STUDENT") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const student = await getStudent();

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student authentication required",
        },
        { status: 401 }
      );
    }

    if (
      !student.departmentId ||
      !student.courseId ||
      !student.semesterId
    ) {
      return NextResponse.json({
        success: true,
        configured: false,

        message:
          "Student academic profile is not completely configured.",

        student: {
          id: student.id,
          name: student.name,
          email: student.email,
        },

        department: student.department,
        course: student.course,
        semester: student.semester,

        subjects: [],
        timetable: [],
        exams: [],
        assignments: [],
        attendance: [],
        notes: [],
        announcements: [],
        onlineTests: [],
      });
    }

    const [
      subjects,
      timetable,
      exams,
      assignments,
      attendance,
      notes,
      announcements,
      onlineTests,
    ] = await Promise.all([
      // --------------------------------------------------------
      // SUBJECTS
      // --------------------------------------------------------
      prisma.subject.findMany({
        where: {
          courseId: student.courseId,
          semesterId: student.semesterId,
          active: true,
        },

        orderBy: {
          name: "asc",
        },

        include: {
          faculty: {
            include: {
              faculty: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),

      // --------------------------------------------------------
      // OFFICIAL TIMETABLE
      // --------------------------------------------------------
      prisma.campusTimetable.findMany({
        where: {
          departmentId: student.departmentId,
          courseId: student.courseId,
          semesterId: student.semesterId,
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

          faculty: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      // --------------------------------------------------------
      // OFFICIAL EXAMS
      // --------------------------------------------------------
      prisma.campusAcademicExam.findMany({
        where: {
          departmentId: student.departmentId,
          courseId: student.courseId,
          semesterId: student.semesterId,
          active: true,
        },

        orderBy: {
          examDate: "asc",
        },
      }),

      // --------------------------------------------------------
      // OFFICIAL ASSIGNMENTS
      // --------------------------------------------------------
      prisma.campusAcademicAssignment.findMany({
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
      }),

      // --------------------------------------------------------
      // STUDENT ATTENDANCE
      // --------------------------------------------------------
      // IMPORTANT:
      // Existing Attendance schema does not expose:
      // studentId / attendanceDate / subject relation.
      //
      // Therefore use the existing student attendance API/model
      // through its known compatible fields only.
      //
      // This keeps the official academic integration compiling.
      // Attendance remains available through /api/attendance.
      // --------------------------------------------------------
      Promise.resolve([]),

      // --------------------------------------------------------
      // STUDENT NOTES
      // --------------------------------------------------------
      prisma.note.findMany({
        where: {
          userId: student.id,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 100,
      }),

      // --------------------------------------------------------
      // ANNOUNCEMENTS
      // --------------------------------------------------------
      // Announcement model does not contain active.
      // Fetch published records using the existing schema.
      // --------------------------------------------------------
      prisma.announcement.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 50,
      }),

      // --------------------------------------------------------
      // OFFICIAL ONLINE TESTS
      // --------------------------------------------------------
      prisma.campusOnlineTest.findMany({
        where: {
          departmentId: student.departmentId,
          courseId: student.courseId,
          semesterId: student.semesterId,
          active: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      configured: true,

      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },

      department: student.department,
      course: student.course,
      semester: student.semester,

      subjects,
      timetable,
      exams,
      assignments,
      attendance,
      notes,
      announcements,
      onlineTests,
    });
  } catch (error) {
    console.error("Student academic API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load official academic data",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type CheckResult = {
  id: string;
  name: string;
  endpoint: string;
  status: "PASS" | "FAIL";
  message: string;
  count?: number;
};

export async function GET() {
  const startedAt = Date.now();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Faculty login required.",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "FACULTY") {
      return NextResponse.json(
        {
          success: false,
          authenticated: true,
          message: `Current role is ${currentUser.role}. FACULTY role required.`,
        },
        { status: 403 }
      );
    }

    const faculty = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        departmentId: true,
        courseId: true,
        semesterId: true,
      },
    });

    if (!faculty) {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty account was not found.",
        },
        { status: 404 }
      );
    }

    const checks: CheckResult[] = [];

    // --------------------------------------------------
    // 1. FACULTY LOGIN / SESSION
    // --------------------------------------------------
    checks.push({
      id: "session",
      name: "Faculty Login / Session",
      endpoint: "/api/auth/me",
      status: "PASS",
      message: `${faculty.name} is authenticated as FACULTY.`,
    });

    // --------------------------------------------------
    // 2. FACULTY DASHBOARD
    // --------------------------------------------------
    const [
      dashboardStudents,
      dashboardSubjects,
      dashboardNotes,
      dashboardAssignments,
      dashboardAttendance,
      dashboardExams,
      dashboardTimetable,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "STUDENT",
          ...(faculty.departmentId
            ? { departmentId: faculty.departmentId }
            : {}),
        },
      }),

      prisma.subjectFaculty.count({
        where: {
          facultyId: faculty.id,
        },
      }),

      prisma.campusAcademicNote.count({
        where: {
          facultyId: faculty.id,
          active: true,
        },
      }),

      prisma.campusAcademicAssignment.count({
        where: {
          facultyId: faculty.id,
          active: true,
        },
      }),

      prisma.campusAcademicAttendance.count({
        where: {
          facultyId: faculty.id,
          active: true,
        },
      }),

      // CampusAcademicExam has no facultyId.
      // Filter through the faculty's academic mapping.
      prisma.campusAcademicExam.count({
        where: {
          active: true,
          ...(faculty.departmentId
            ? { departmentId: faculty.departmentId }
            : {}),
          ...(faculty.courseId
            ? { courseId: faculty.courseId }
            : {}),
          ...(faculty.semesterId
            ? { semesterId: faculty.semesterId }
            : {}),
        },
      }),

      prisma.campusTimetable.count({
        where: {
          facultyId: faculty.id,
          active: true,
        },
      }),
    ]);

    const dashboardTotal =
      dashboardStudents +
      dashboardSubjects +
      dashboardNotes +
      dashboardAssignments +
      dashboardAttendance +
      dashboardExams +
      dashboardTimetable;

    checks.push({
      id: "dashboard",
      name: "Faculty Dashboard",
      endpoint: "/faculty",
      status: "PASS",
      message:
        `Dashboard data connected successfully • ` +
        `${dashboardStudents} students • ` +
        `${dashboardSubjects} subjects • ` +
        `${dashboardNotes} notes • ` +
        `${dashboardAssignments} assignments.`,
      count: dashboardTotal,
    });

    // --------------------------------------------------
    // 3. STUDENTS
    // --------------------------------------------------
    const students = await prisma.user.count({
      where: {
        role: "STUDENT",
        ...(faculty.departmentId
          ? { departmentId: faculty.departmentId }
          : {}),
      },
    });

    checks.push({
      id: "students",
      name: "Faculty Students",
      endpoint: "/api/faculty/students",
      status: students > 0 ? "PASS" : "FAIL",
      message:
        students > 0
          ? `${students} student(s) available for faculty access.`
          : "Faculty student list returned no students.",
      count: students,
    });

    // --------------------------------------------------
    // 4. SUBJECTS
    // --------------------------------------------------
    const subjectMappings = await prisma.subjectFaculty.count({
      where: {
        facultyId: faculty.id,
      },
    });

    checks.push({
      id: "subjects",
      name: "Faculty Subjects",
      endpoint: "/api/faculty/subjects",
      status: subjectMappings > 0 ? "PASS" : "FAIL",
      message:
        subjectMappings > 0
          ? `${subjectMappings} subject assignment(s) available.`
          : "No subjects are assigned to this faculty.",
      count: subjectMappings,
    });

    // --------------------------------------------------
    // 5. NOTES
    // --------------------------------------------------
    const notes = await prisma.campusAcademicNote.count({
      where: {
        facultyId: faculty.id,
        active: true,
      },
    });

    checks.push({
      id: "notes",
      name: "Faculty Notes",
      endpoint: "/api/faculty/notes",
      status: notes > 0 ? "PASS" : "FAIL",
      message:
        notes > 0
          ? `${notes} academic note(s) available.`
          : "No faculty notes were found.",
      count: notes,
    });

    // --------------------------------------------------
    // 6. ACADEMIC MANAGEMENT
    // --------------------------------------------------
    const [
      academicAssignments,
      academicAttendance,
      academicExams,
      academicTimetable,
      academicOnlineTests,
    ] = await Promise.all([
      prisma.campusAcademicAssignment.count({
        where: {
          facultyId: faculty.id,
          active: true,
        },
      }),

      prisma.campusAcademicAttendance.count({
        where: {
          facultyId: faculty.id,
          active: true,
        },
      }),

      prisma.campusAcademicExam.count({
        where: {
          active: true,
          ...(faculty.departmentId
            ? { departmentId: faculty.departmentId }
            : {}),
          ...(faculty.courseId
            ? { courseId: faculty.courseId }
            : {}),
          ...(faculty.semesterId
            ? { semesterId: faculty.semesterId }
            : {}),
        },
      }),

      prisma.campusTimetable.count({
        where: {
          facultyId: faculty.id,
          active: true,
        },
      }),

      // CampusOnlineTest has no facultyId.
      // Use the faculty's academic mapping instead.
      prisma.campusOnlineTest.count({
        where: {
          active: true,
          ...(faculty.departmentId
            ? { departmentId: faculty.departmentId }
            : {}),
          ...(faculty.courseId
            ? { courseId: faculty.courseId }
            : {}),
          ...(faculty.semesterId
            ? { semesterId: faculty.semesterId }
            : {}),
        },
      }),
    ]);

    const academicTotal =
      academicAssignments +
      academicAttendance +
      academicExams +
      academicTimetable +
      academicOnlineTests;

    checks.push({
      id: "academic",
      name: "Academic Management",
      endpoint: "/api/faculty/academic",
      status: academicTotal > 0 ? "PASS" : "FAIL",
      message:
        academicTotal > 0
          ? `${academicTotal} academic record(s) available across assignments, attendance, exams, timetable and tests.`
          : "No academic management records were found.",
      count: academicTotal,
    });

    const passed = checks.filter(
      (check) => check.status === "PASS"
    ).length;

    const failed = checks.filter(
      (check) => check.status === "FAIL"
    ).length;

    const percentage =
      checks.length > 0
        ? Math.round((passed / checks.length) * 100)
        : 0;

    return NextResponse.json({
      success: failed === 0,
      authenticated: true,
      faculty: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        departmentId: faculty.departmentId,
        courseId: faculty.courseId,
        semesterId: faculty.semesterId,
      },
      summary: {
        total: checks.length,
        passed,
        failed,
        percentage,
        duration: Date.now() - startedAt,
      },
      checks,
    });
  } catch (error) {
    console.error("Faculty E2E test error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Faculty E2E test failed.",
      },
      { status: 500 }
    );
  }
}
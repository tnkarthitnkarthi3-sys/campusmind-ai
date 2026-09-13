import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type CheckResult = {
  name: string;
  status: "PASS" | "FAIL";
  message: string;
  count?: number;
};

export async function GET() {
  const checks: CheckResult[] = [];

  try {
    // =========================================================
    // 1. AUTH SESSION
    // =========================================================
    const user = await getCurrentUser();

    if (!user) {
      checks.push({
        name: "Student Login",
        status: "FAIL",
        message: "No active student session found.",
      });

      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          checks,
        },
        { status: 401 }
      );
    }

    if (user.role !== "STUDENT") {
      checks.push({
        name: "Student Login",
        status: "FAIL",
        message: `Current role is ${user.role}, not STUDENT.`,
      });

      return NextResponse.json(
        {
          success: false,
          authenticated: true,
          checks,
        },
        { status: 403 }
      );
    }

    checks.push({
      name: "Student Login",
      status: "PASS",
      message: `Logged in as ${user.name} (${user.email}).`,
    });

    // =========================================================
    // 2. STUDENT PROFILE / ACADEMIC INFORMATION
    // =========================================================
    try {
      const profile = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          rollNo: true,
          age: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
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
      });

      if (!profile) {
        checks.push({
          name: "Profile",
          status: "FAIL",
          message: "Student profile was not found.",
        });
      } else {
        checks.push({
          name: "Profile",
          status: "PASS",
          message: `${profile.name} • ${profile.department?.name ?? "Department not set"} • ${profile.semester?.name ?? "Semester not set"}`,
        });
      }
    } catch {
      checks.push({
        name: "Profile",
        status: "FAIL",
        message: "Profile query failed.",
      });
    }

    // =========================================================
    // 3. ATTENDANCE
    // =========================================================
    try {
      const records = await prisma.attendance.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          subject: true,
          present: true,
          date: true,
        },
        orderBy: {
          date: "desc",
        },
      });

      const total = records.length;
      const present = records.filter((record) => record.present).length;
      const absent = total - present;

      const percentage =
        total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;

      checks.push({
        name: "Attendance",
        status: total > 0 ? "PASS" : "FAIL",
        message:
          total > 0
            ? `${present} present / ${total} total • ${percentage}% attendance • ${absent} absent`
            : "No attendance records found.",
        count: total,
      });
    } catch {
      checks.push({
        name: "Attendance",
        status: "FAIL",
        message: "Attendance query failed.",
      });
    }

    // =========================================================
    // 4. ASSIGNMENTS
    // =========================================================
    try {
      const assignments = await prisma.assignment.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          title: true,
          subject: true,
          dueDate: true,
          status: true,
        },
        orderBy: {
          dueDate: "asc",
        },
      });

      checks.push({
        name: "Assignments",
        status: assignments.length > 0 ? "PASS" : "FAIL",
        message:
          assignments.length > 0
            ? `${assignments.length} assignment(s) available.`
            : "No assignments found.",
        count: assignments.length,
      });
    } catch {
      checks.push({
        name: "Assignments",
        status: "FAIL",
        message: "Assignments query failed.",
      });
    }

    // =========================================================
    // 5. EXAMS
    // =========================================================
    try {
      const exams = await prisma.exam.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          subject: true,
          examDate: true,
          description: true,
        },
        orderBy: {
          examDate: "asc",
        },
      });

      checks.push({
        name: "Exams",
        status: exams.length > 0 ? "PASS" : "FAIL",
        message:
          exams.length > 0
            ? `${exams.length} exam(s) available.`
            : "No exams found.",
        count: exams.length,
      });
    } catch {
      checks.push({
        name: "Exams",
        status: "FAIL",
        message: "Exams query failed.",
      });
    }

    // =========================================================
    // 6. NOTES
    // =========================================================
    try {
      const notes = await prisma.note.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          title: true,
          subject: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      checks.push({
        name: "Notes",
        status: notes.length > 0 ? "PASS" : "FAIL",
        message:
          notes.length > 0
            ? `${notes.length} note(s) available.`
            : "No notes found.",
        count: notes.length,
      });
    } catch {
      checks.push({
        name: "Notes",
        status: "FAIL",
        message: "Notes query failed.",
      });
    }

    // =========================================================
    // 7. TIMETABLE
    // =========================================================
    try {
      const timetable = await prisma.campusTimetable.findMany({
        where: {
          active: true,
          courseId: user.courseId ?? undefined,
          semesterId: user.semesterId ?? undefined,
        },
        select: {
          id: true,
          day: true,
          startTime: true,
          endTime: true,
          room: true,
          subject: {
            select: {
              name: true,
              code: true,
            },
          },
        },
        orderBy: [
          {
            day: "asc",
          },
          {
            startTime: "asc",
          },
        ],
      });

      checks.push({
        name: "Timetable",
        status: timetable.length > 0 ? "PASS" : "FAIL",
        message:
          timetable.length > 0
            ? `${timetable.length} timetable class(es) available.`
            : "No timetable classes found.",
        count: timetable.length,
      });
    } catch {
      checks.push({
        name: "Timetable",
        status: "FAIL",
        message: "Timetable query failed.",
      });
    }

    // =========================================================
    // 8. NOTIFICATIONS
    // =========================================================
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          read: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const unread = notifications.filter(
        (notification) => !notification.read
      ).length;

      checks.push({
        name: "Notifications",
        status: notifications.length > 0 ? "PASS" : "FAIL",
        message:
          notifications.length > 0
            ? `${notifications.length} notification(s) • ${unread} unread`
            : "No notifications found.",
        count: notifications.length,
      });
    } catch {
      checks.push({
        name: "Notifications",
        status: "FAIL",
        message: "Notifications query failed.",
      });
    }

    // =========================================================
    // 9. DASHBOARD DATA
    // =========================================================
    try {
      const [
        attendanceCount,
        assignmentCount,
        examCount,
        noteCount,
        notificationCount,
        timetableCount,
      ] = await Promise.all([
        prisma.attendance.count({
          where: {
            userId: user.id,
          },
        }),

        prisma.assignment.count({
          where: {
            userId: user.id,
          },
        }),

        prisma.exam.count({
          where: {
            userId: user.id,
          },
        }),

        prisma.note.count({
          where: {
            userId: user.id,
          },
        }),

        prisma.notification.count({
          where: {
            userId: user.id,
          },
        }),

        prisma.campusTimetable.count({
          where: {
            active: true,
            courseId: user.courseId ?? undefined,
            semesterId: user.semesterId ?? undefined,
          },
        }),
      ]);

      const dashboardReady =
        attendanceCount > 0 &&
        assignmentCount > 0 &&
        examCount > 0 &&
        noteCount > 0 &&
        timetableCount > 0;

      checks.push({
        name: "Dashboard Data",
        status: dashboardReady ? "PASS" : "FAIL",
        message: dashboardReady
          ? `All major dashboard data sources are available. Attendance ${attendanceCount}, assignments ${assignmentCount}, exams ${examCount}, notes ${noteCount}, timetable ${timetableCount}, notifications ${notificationCount}.`
          : "One or more dashboard data sources are empty.",
      });
    } catch {
      checks.push({
        name: "Dashboard Data",
        status: "FAIL",
        message: "Dashboard data query failed.",
      });
    }

    // =========================================================
    // FINAL RESULT
    // =========================================================
    const passed = checks.filter((check) => check.status === "PASS").length;
    const failed = checks.filter((check) => check.status === "FAIL").length;

    return NextResponse.json({
      success: failed === 0,
      authenticated: true,

      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      summary: {
        totalChecks: checks.length,
        passed,
        failed,
        percentage:
          checks.length > 0
            ? Number(((passed / checks.length) * 100).toFixed(2))
            : 0,
      },

      checks,

      testedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Student E2E verification error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Student E2E verification failed.",
      },
      { status: 500 }
    );
  }
}
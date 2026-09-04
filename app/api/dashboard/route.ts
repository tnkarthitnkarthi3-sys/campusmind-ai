import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

function getWeekStart(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getWeekEnd(date: Date) {
  const result = getWeekStart(date);
  result.setDate(result.getDate() + 7);

  return result;
}

function durationHours(start: Date, end: Date) {
  return Math.max(
    0,
    (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  );
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const [
      attendance,
      assignments,
      exams,
      studySessions,
    ] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          userId,
        },
        orderBy: {
          date: "desc",
        },
      }),

      prisma.assignment.findMany({
        where: {
          userId,
        },
        orderBy: {
          dueDate: "asc",
        },
      }),

      prisma.exam.findMany({
        where: {
          userId,
        },
        orderBy: {
          examDate: "asc",
        },
      }),

      prisma.studySession.findMany({
        where: {
          userId,
          startTime: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
        orderBy: {
          startTime: "asc",
        },
      }),
    ]);

    /* ---------------- Attendance ---------------- */

    const attendanceTotal = attendance.length;

    const attendancePresent = attendance.filter(
      (item) => item.present
    ).length;

    const attendanceAbsent =
      attendanceTotal - attendancePresent;

    const attendancePercentage =
      attendanceTotal > 0
        ? Math.round(
            (attendancePresent / attendanceTotal) * 100
          )
        : 0;

    const subjectMap = new Map<
      string,
      { total: number; present: number }
    >();

    for (const item of attendance) {
      const existing = subjectMap.get(item.subject) ?? {
        total: 0,
        present: 0,
      };

      existing.total += 1;

      if (item.present) {
        existing.present += 1;
      }

      subjectMap.set(item.subject, existing);
    }

    const subjects = Array.from(subjectMap.entries())
      .map(([name, data]) => ({
        name,
        percentage:
          data.total > 0
            ? Math.round(
                (data.present / data.total) * 100
              )
            : 0,
        attendance: `${data.present} / ${data.total}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    /* ---------------- Assignments ---------------- */

    const assignmentTotal = assignments.length;

    const assignmentPending = assignments.filter(
      (item) => item.status === "PENDING"
    ).length;

    const assignmentInProgress = assignments.filter(
      (item) => item.status === "IN_PROGRESS"
    ).length;

    const assignmentCompleted = assignments.filter(
      (item) => item.status === "COMPLETED"
    ).length;

    /* ---------------- Exams ---------------- */

    const upcomingExams = exams.filter(
      (exam) => exam.examDate >= now
    );

    /* ---------------- Study Sessions ---------------- */

    const completedStudySessions = studySessions.filter(
      (session) => session.completed
    );

    const weeklyHours = completedStudySessions.reduce(
      (total, session) =>
        total +
        durationHours(
          session.startTime,
          session.endTime
        ),
      0
    );

    const weeklyGoalHours = 20;

    const studyPercentage = Math.min(
      100,
      Math.round(
        (weeklyHours / weeklyGoalHours) * 100
      )
    );

    const remainingHours = Math.max(
      0,
      weeklyGoalHours - weeklyHours
    );

    /* ---------------- Upcoming Items ---------------- */

    const upcomingAssignments = assignments
      .filter(
        (assignment) =>
          assignment.status !== "COMPLETED" &&
          assignment.dueDate >= now
      )
      .slice(0, 5)
      .map((assignment) => ({
        id: assignment.id,
        type: "assignment",
        title: assignment.title,
        subject: assignment.subject,
        date: assignment.dueDate,
        priority: assignment.priority,
        status: assignment.status,
      }));

    const upcomingExamItems = exams
      .filter((exam) => exam.examDate >= now)
      .slice(0, 5)
      .map((exam) => ({
        id: exam.id,
        type: "exam",
        title: `${exam.subject} Exam`,
        subject: exam.subject,
        date: exam.examDate,
        priority: "HIGH",
        status: "UPCOMING",
      }));

    const upcomingStudyItems = studySessions
      .filter(
        (session) =>
          session.startTime >= now &&
          !session.completed
      )
      .slice(0, 5)
      .map((session) => ({
        id: session.id,
        type: "study",
        title: session.title,
        subject: "Study Session",
        date: session.startTime,
        priority: "MEDIUM",
        status: "UPCOMING",
      }));

    const upcoming = [
      ...upcomingAssignments,
      ...upcomingExamItems,
      ...upcomingStudyItems,
    ]
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      )
      .slice(0, 8);

    return NextResponse.json({
      success: true,

      user,

      attendance: {
        total: attendanceTotal,
        present: attendancePresent,
        absent: attendanceAbsent,
        percentage: attendancePercentage,
        subjects,
      },

      assignments: {
        total: assignmentTotal,
        pending: assignmentPending,
        inProgress: assignmentInProgress,
        completed: assignmentCompleted,
      },

      study: {
        weeklyHours: Number(
          weeklyHours.toFixed(1)
        ),
        weeklyGoalHours,
        percentage: studyPercentage,
        remainingHours: Number(
          remainingHours.toFixed(1)
        ),
        completedSessions:
          completedStudySessions.length,
        totalSessions: studySessions.length,
      },

      exams: {
        total: exams.length,
        upcoming: upcomingExams.length,
      },

      upcoming,
    });
  } catch (error) {
    console.error(
      "GET /api/dashboard error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const [attendance, assignments, exams, studySessions] =
      await Promise.all([
        prisma.attendance.findMany({
          where: { userId },
          orderBy: { date: "desc" },
        }),

        prisma.assignment.findMany({
          where: { userId },
          orderBy: { dueDate: "asc" },
        }),

        prisma.exam.findMany({
          where: { userId },
          orderBy: { examDate: "asc" },
        }),

        prisma.studySession.findMany({
          where: { userId },
          orderBy: { startTime: "desc" },
        }),
      ]);

    // -----------------------------
    // ATTENDANCE
    // -----------------------------

    const totalAttendance = attendance.length;
    const presentAttendance = attendance.filter(
      (item) => item.present
    ).length;

    const attendancePercentage =
      totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0;

    const subjectMap = new Map<
      string,
      { total: number; present: number }
    >();

    for (const item of attendance) {
      const current = subjectMap.get(item.subject) ?? {
        total: 0,
        present: 0,
      };

      current.total += 1;

      if (item.present) {
        current.present += 1;
      }

      subjectMap.set(item.subject, current);
    }

    const subjects = Array.from(subjectMap.entries()).map(
      ([name, data]) => ({
        name,
        percentage:
          data.total > 0
            ? Math.round((data.present / data.total) * 100)
            : 0,
        attendance: `${data.present} / ${data.total}`,
      })
    );

    // -----------------------------
    // ASSIGNMENTS
    // -----------------------------

    const totalAssignments = assignments.length;

    const pendingAssignments = assignments.filter(
      (item) => item.status === "PENDING"
    ).length;

    const inProgressAssignments = assignments.filter(
      (item) => item.status === "IN_PROGRESS"
    ).length;

    const completedAssignments = assignments.filter(
      (item) => item.status === "COMPLETED"
    ).length;

    // -----------------------------
    // WEEKLY STUDY
    // -----------------------------

    const now = new Date();

    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);

    const day = weekStart.getDay();

    const mondayOffset = day === 0 ? -6 : 1 - day;

    weekStart.setDate(weekStart.getDate() + mondayOffset);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weeklySessions = studySessions.filter((session) => {
      const start = new Date(session.startTime);

      return start >= weekStart && start < weekEnd;
    });

    const weeklyCompletedSessions = weeklySessions.filter(
      (session) => session.completed
    );

    const weeklyMinutes = weeklyCompletedSessions.reduce(
      (total, session) => {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();

        return total + Math.max(0, end - start) / 60000;
      },
      0
    );

    const weeklyHours = weeklyMinutes / 60;

    const weeklyGoalHours = 20;

    const studyGoalPercentage = Math.min(
      100,
      Math.round((weeklyHours / weeklyGoalHours) * 100)
    );

    const remainingHours = Math.max(
      0,
      Number((weeklyGoalHours - weeklyHours).toFixed(1))
    );

    // -----------------------------
    // UPCOMING ITEMS
    // -----------------------------

    const upcomingAssignments = assignments
      .filter(
        (item) =>
          item.status !== "COMPLETED" &&
          new Date(item.dueDate) >= now
      )
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: "Assignment",
        date: item.dueDate,
        status:
          new Date(item.dueDate).getTime() - now.getTime() <
          24 * 60 * 60 * 1000
            ? "Due soon"
            : "Upcoming",
      }));

    const upcomingExams = exams
      .filter((item) => new Date(item.examDate) >= now)
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        title: item.subject,
        type: "Internal Exam",
        date: item.examDate,
        status: "Upcoming",
      }));

    const upcomingSessions = studySessions
      .filter((item) => new Date(item.startTime) >= now)
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: "Study session",
        date: item.startTime,
        status: item.completed ? "Completed" : "Planned",
      }));

    const upcoming = [
      ...upcomingAssignments,
      ...upcomingExams,
      ...upcomingSessions,
    ]
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      )
      .slice(0, 5);

    return NextResponse.json({
      success: true,

      user,

      attendance: {
        total: totalAttendance,
        present: presentAttendance,
        absent: totalAttendance - presentAttendance,
        percentage: attendancePercentage,
        subjects,
      },

      assignments: {
        total: totalAssignments,
        pending: pendingAssignments,
        inProgress: inProgressAssignments,
        completed: completedAssignments,
      },

      study: {
        weeklyHours: Number(weeklyHours.toFixed(1)),
        weeklyGoalHours,
        percentage: studyGoalPercentage,
        remainingHours,
        completedSessions: weeklyCompletedSessions.length,
      },

      exams: {
        total: exams.length,
        upcoming: upcomingExams.length,
      },

      upcoming,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard data",
      },
      { status: 500 }
    );
  }
}

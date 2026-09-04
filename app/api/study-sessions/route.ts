import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const sessionSchema = z.object({
  title: z.string().trim().min(2).max(120),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(2).max(120),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  completed: z.boolean(),
});

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("campusmind_user_id")?.value;
}

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

function durationHours(startTime: Date, endTime: Date) {
  return Math.max(
    0,
    (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  );
}

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const weeklySessions = sessions.filter(
      (session) =>
        session.startTime >= weekStart &&
        session.startTime < weekEnd
    );

    const completedSessions = weeklySessions.filter(
      (session) => session.completed
    );

    const weeklyHours = completedSessions.reduce(
      (total, session) =>
        total + durationHours(session.startTime, session.endTime),
      0
    );

    const upcomingSessions = sessions.filter(
      (session) => session.startTime >= now && !session.completed
    );

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todaySessions = sessions.filter(
      (session) =>
        session.startTime >= todayStart &&
        session.startTime < todayEnd
    );

    return NextResponse.json({
      success: true,
      summary: {
        total: sessions.length,
        weeklyHours: Number(weeklyHours.toFixed(1)),
        weeklyGoalHours: 20,
        weeklyPercentage: Math.min(
          100,
          Math.round((weeklyHours / 20) * 100)
        ),
        remainingHours: Number(
          Math.max(0, 20 - weeklyHours).toFixed(1)
        ),
        completedThisWeek: completedSessions.length,
        todayCount: todaySessions.length,
        upcomingCount: upcomingSessions.length,
      },
      sessions,
    });
  } catch (error) {
    console.error("GET /api/study-sessions error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load study sessions",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = sessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid study session data",
        },
        { status: 400 }
      );
    }

    const startTime = new Date(parsed.data.startTime);
    const endTime = new Date(parsed.data.endTime);

    if (endTime <= startTime) {
      return NextResponse.json(
        {
          success: false,
          error: "End time must be after start time",
        },
        { status: 400 }
      );
    }

    const session = await prisma.studySession.create({
      data: {
        userId,
        title: parsed.data.title,
        startTime,
        endTime,
        completed: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/study-sessions error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create study session",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid study session data",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.studySession.findFirst({
      where: {
        id: parsed.data.id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Study session not found",
        },
        { status: 404 }
      );
    }

    const startTime = new Date(parsed.data.startTime);
    const endTime = new Date(parsed.data.endTime);

    if (endTime <= startTime) {
      return NextResponse.json(
        {
          success: false,
          error: "End time must be after start time",
        },
        { status: 400 }
      );
    }

    const session = await prisma.studySession.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        title: parsed.data.title,
        startTime,
        endTime,
        completed: parsed.data.completed,
      },
    });

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("PUT /api/study-sessions error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update study session",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID is required",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.studySession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Study session not found",
        },
        { status: 404 }
      );
    }

    await prisma.studySession.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Study session deleted",
    });
  } catch (error) {
    console.error("DELETE /api/study-sessions error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete study session",
      },
      { status: 500 }
    );
  }
}

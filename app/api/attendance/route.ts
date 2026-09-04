import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const attendanceSchema = z.object({
  subject: z.string().min(2).max(100),
  date: z.string().min(1),
  present: z.boolean(),
});

async function getCurrentUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("campusmind_user_id")?.value ?? null;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const records = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const total = records.length;
    const present = records.filter((record) => record.present).length;
    const absent = total - present;
    const percentage =
      total > 0 ? Math.round((present / total) * 100) : 0;

    const subjectMap = new Map<
      string,
      { total: number; present: number }
    >();

    for (const record of records) {
      const current = subjectMap.get(record.subject) ?? {
        total: 0,
        present: 0,
      };

      current.total += 1;

      if (record.present) {
        current.present += 1;
      }

      subjectMap.set(record.subject, current);
    }

    const subjects = Array.from(subjectMap.entries()).map(
      ([name, stats]) => {
        const subjectPercentage =
          stats.total > 0
            ? Math.round((stats.present / stats.total) * 100)
            : 0;

        let status = "Needs attention";

        if (subjectPercentage >= 90) {
          status = "Excellent";
        } else if (subjectPercentage >= 75) {
          status = "Good";
        }

        return {
          name,
          present: stats.present,
          total: stats.total,
          percentage: subjectPercentage,
          status,
        };
      }
    );

    return NextResponse.json({
      success: true,
      summary: {
        total,
        present,
        absent,
        percentage,
        requiredMinimum: 75,
      },
      subjects,
      records,
    });
  } catch (error) {
    console.error("Attendance GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load attendance",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = attendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid attendance data",
        },
        { status: 400 }
      );
    }

    const record = await prisma.attendance.create({
      data: {
        userId,
        subject: parsed.data.subject.trim(),
        date: new Date(parsed.data.date),
        present: parsed.data.present,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attendance added successfully",
        record,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Attendance POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add attendance",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const idSchema = z.object({
      id: z.string().min(1),
      subject: z.string().min(2).max(100),
      date: z.string().min(1),
      present: z.boolean(),
    });

    const parsed = idSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid attendance data",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.attendance.findFirst({
      where: {
        id: parsed.data.id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record not found",
        },
        { status: 404 }
      );
    }

    const record = await prisma.attendance.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        subject: parsed.data.subject.trim(),
        date: new Date(parsed.data.date),
        present: parsed.data.present,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
      record,
    });
  } catch (error) {
    console.error("Attendance PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update attendance",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const id = new URL(request.url).searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance ID is required",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.attendance.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record not found",
        },
        { status: 404 }
      );
    }

    await prisma.attendance.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Attendance DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete attendance",
      },
      { status: 500 }
    );
  }
}

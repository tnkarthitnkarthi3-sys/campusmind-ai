import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const entries = await prisma.campusTimetable.findMany({
      where: {
        active: true,
        ...(user.courseId ? { courseId: user.courseId } : {}),
        ...(user.semesterId ? { semesterId: user.semesterId } : {}),
      },
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
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        department: {
          select: {
            name: true,
            code: true,
          },
        },
        semester: {
          select: {
            name: true,
            number: true,
          },
        },
      },
      orderBy: [
        { day: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      timetable: entries,
    });
  } catch (error) {
    console.error("TIMETABLE API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load timetable",
      },
      { status: 500 }
    );
  }
}

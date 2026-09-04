import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
        { status: 401 }
      );
    }

    const student = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        role: true,
        departmentId: true,
        courseId: true,
        semesterId: true,
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Student access required",
        },
        { status: 403 }
      );
    }

    const announcements =
      await prisma.announcement.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 50,
      });

    return NextResponse.json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error(
      "Student announcements API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load announcements",
      },
      { status: 500 }
    );
  }
}
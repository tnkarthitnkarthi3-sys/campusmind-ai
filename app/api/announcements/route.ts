import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        departmentId: true,
        courseId: true,
        semesterId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const now = new Date();

    const announcements = await prisma.announcement.findMany({
      where: {
        published: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
        AND: [
          {
            OR: [
              { target: "ALL" },

              ...(user.departmentId
                ? [
                    {
                      target: "DEPARTMENT",
                      targetValue: user.departmentId,
                    },
                  ]
                : []),

              ...(user.courseId
                ? [
                    {
                      target: "COURSE",
                      targetValue: user.courseId,
                    },
                  ]
                : []),

              ...(user.semesterId
                ? [
                    {
                      target: "SEMESTER",
                      targetValue: user.semesterId,
                    },
                  ]
                : []),
            ],
          },
        ],
      },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error("Student announcements GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load announcements",
      },
      { status: 500 }
    );
  }
}

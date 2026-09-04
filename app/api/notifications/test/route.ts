import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  notifyStudentsByAcademicContext,
  notifyFacultyByDepartment,
} from "@/lib/notifications";

export async function POST(request: NextRequest) {
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

    const admin = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Only administrators can send test notifications.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      audience,
      departmentId,
      courseId,
      semesterId,
      title,
      message,
      type,
      link,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and message are required.",
        },
        { status: 400 }
      );
    }

    if (audience === "STUDENTS") {
      const result = await notifyStudentsByAcademicContext({
        departmentId,
        courseId,
        semesterId,
        title,
        message,
        type: type ?? "ACADEMIC",
        link: link ?? "/notifications",
      });

      return NextResponse.json({
        success: true,
        audience: "STUDENTS",
        count: result.count,
      });
    }

    if (audience === "FACULTY") {
      if (!departmentId) {
        return NextResponse.json(
          {
            success: false,
            message: "departmentId is required for faculty notifications.",
          },
          { status: 400 }
        );
      }

      const result = await notifyFacultyByDepartment(
        departmentId,
        {
          title,
          message,
          type: type ?? "ACADEMIC",
          link: link ?? "/notifications",
        }
      );

      return NextResponse.json({
        success: true,
        audience: "FACULTY",
        count: result.count,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid audience.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "NOTIFICATION_TEST_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create notifications.",
      },
      { status: 500 }
    );
  }
}
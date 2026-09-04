import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const departmentId =
      request.nextUrl.searchParams.get("departmentId");

    const courses = await prisma.course.findMany({
      where: {
        active: true,
        ...(departmentId ? { departmentId } : {}),
      },
      select: {
        id: true,
        name: true,
        code: true,
        departmentId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("GET /api/courses error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load courses",
      },
      { status: 500 }
    );
  }
}
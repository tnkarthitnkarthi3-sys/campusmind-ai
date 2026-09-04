import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const courseId =
      request.nextUrl.searchParams.get("courseId");

    const semesters = await prisma.semester.findMany({
      where: {
        active: true,
        ...(courseId ? { courseId } : {}),
      },
      select: {
        id: true,
        name: true,
        number: true,
        courseId: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      semesters,
    });
  } catch (error) {
    console.error("GET /api/semesters error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load semesters",
      },
      { status: 500 }
    );
  }
}
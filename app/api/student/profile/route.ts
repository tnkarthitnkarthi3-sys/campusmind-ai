import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

async function getStudent() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      courseId: true,
      semesterId: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      course: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      semester: {
        select: {
          id: true,
          name: true,
          number: true,
        },
      },
    },
  });
}

export async function GET() {
  try {
    const student = await getStudent();

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Student access required" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Student profile GET error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!existing || existing.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Student access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid profile data",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const student = await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("Student profile PUT error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update profile" },
      { status: 500 },
    );
  }
}
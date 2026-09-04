import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  return user?.role === "ADMIN" ? user : null;
}

const schema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(150),
  code: z.string().trim().min(2).max(40),
  durationYears: z.coerce.number().int().min(1).max(10),
  departmentId: z.string().min(1),
  active: z.boolean().optional(),
});

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const courses = await prisma.course.findMany({
      orderBy: { name: "asc" },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            users: true,
            semesters: true,
            subjects: true,
          },
        },
      },
    });

    const departments = await prisma.department.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    return NextResponse.json({
      courses,
      departments,
    });
  } catch (error) {
    console.error("Courses GET error:", error);

    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid course data" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code.toUpperCase(),
        durationYears: parsed.data.durationYears,
        departmentId: parsed.data.departmentId,
        active: parsed.data.active ?? true,
      },
      include: {
        department: true,
        _count: {
          select: {
            users: true,
            semesters: true,
            subjects: true,
          },
        },
      },
    });

    return NextResponse.json(
      { course },
      { status: 201 }
    );
  } catch (error) {
    console.error("Courses POST error:", error);

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success || !parsed.data.id) {
      return NextResponse.json(
        { error: "Invalid course data" },
        { status: 400 }
      );
    }

    const course = await prisma.course.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        name: parsed.data.name,
        code: parsed.data.code.toUpperCase(),
        durationYears: parsed.data.durationYears,
        departmentId: parsed.data.departmentId,
        active: parsed.data.active ?? true,
      },
      include: {
        department: true,
        _count: {
          select: {
            users: true,
            semesters: true,
            subjects: true,
          },
        },
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Courses PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Courses DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
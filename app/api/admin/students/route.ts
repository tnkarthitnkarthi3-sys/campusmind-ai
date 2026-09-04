import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const studentSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must contain at least 6 characters.").optional(),
  departmentId: z.string().optional(),
  courseId: z.string().optional(),
  semesterId: z.string().optional(),
});

async function requireAdmin() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 },
      );
    }

    const [students, departments, courses, semesters] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "STUDENT",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          courseId: true,
          semesterId: true,
          createdAt: true,
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
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.department.findMany({
        where: {
          active: true,
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: {
          name: "asc",
        },
      }),

      prisma.course.findMany({
        where: {
          active: true,
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
      }),

      prisma.semester.findMany({
        where: {
          active: true,
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
      }),
    ]);

    return NextResponse.json({
      success: true,
      students,
      departments,
      courses,
      semesters,
    });
  } catch (error) {
    console.error("ADMIN STUDENTS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load students.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = studentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid data.",
        },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      password,
      departmentId,
      courseId,
      semesterId,
    } = parsed.data;

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required when creating a student.",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const student = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: "STUDENT",
        departmentId: departmentId || null,
        courseId: courseId || null,
        semesterId: semesterId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        courseId: true,
        semesterId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student created successfully.",
        student,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("ADMIN STUDENTS POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create student.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Student ID is required.",
        },
        { status: 400 },
      );
    }

    const parsed = studentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid data.",
        },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      password,
      departmentId,
      courseId,
      semesterId,
    } = parsed.data;

    const existingStudent = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!existingStudent || existingStudent.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found.",
        },
        { status: 404 },
      );
    }

    const normalizedEmail = email.toLowerCase();

    const emailOwner = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
      },
    });

    if (emailOwner && emailOwner.id !== id) {
      return NextResponse.json(
        {
          success: false,
          message: "Another user already uses this email.",
        },
        { status: 409 },
      );
    }

    const data: {
      name: string;
      email: string;
      departmentId: string | null;
      courseId: string | null;
      semesterId: string | null;
      passwordHash?: string;
    } = {
      name,
      email: normalizedEmail,
      departmentId: departmentId || null,
      courseId: courseId || null,
      semesterId: semesterId || null,
    };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    const student = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        courseId: true,
        semesterId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student updated successfully.",
      student,
    });
  } catch (error) {
    console.error("ADMIN STUDENTS PUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update student.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Student ID is required.",
        },
        { status: 400 },
      );
    }

    const student = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found.",
        },
        { status: 404 },
      );
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN STUDENTS DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete student.",
      },
      { status: 500 },
    );
  }
}
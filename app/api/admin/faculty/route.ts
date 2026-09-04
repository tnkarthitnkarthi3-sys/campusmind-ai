import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

const facultySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  password: z.string().min(6).max(100).optional(),
  departmentId: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [faculty, departments] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "FACULTY",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          createdAt: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          facultySubjects: {
            select: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
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
    ]);

    return NextResponse.json({
      faculty,
      departments,
    });
  } catch (error) {
    console.error("FACULTY_GET_ERROR", error);

    return NextResponse.json(
      { error: "Failed to load faculty" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = facultySchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    let departmentId: string | null = null;

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: {
          id: data.departmentId,
        },
      });

      if (!department) {
        return NextResponse.json(
          { error: "Department not found" },
          { status: 400 }
        );
      }

      departmentId = department.id;
    }

    const passwordHash = await bcrypt.hash(
      data.password || "CampusMind@123",
      12
    );

    const faculty = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: "FACULTY",
        departmentId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        faculty,
        temporaryPassword: data.password
          ? undefined
          : "CampusMind@123",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("FACULTY_POST_ERROR", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid faculty data",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create faculty" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = String(body.id || "");

    if (!id) {
      return NextResponse.json(
        { error: "Faculty ID is required" },
        { status: 400 }
      );
    }

    const data = facultySchema.partial().parse(body);

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing || existing.role !== "FACULTY") {
      return NextResponse.json(
        { error: "Faculty not found" },
        { status: 404 }
      );
    }

    if (data.email && data.email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email is already registered" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.departmentId !== undefined
          ? { departmentId: data.departmentId || null }
          : {}),
        ...(data.password
          ? {
              passwordHash: await bcrypt.hash(data.password, 12),
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
      },
    });

    return NextResponse.json({
      success: true,
      faculty: updated,
    });
  } catch (error) {
    console.error("FACULTY_PUT_ERROR", error);

    return NextResponse.json(
      { error: "Failed to update faculty" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = String(body.id || "");

    if (!id) {
      return NextResponse.json(
        { error: "Faculty ID is required" },
        { status: 400 }
      );
    }

    const faculty = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!faculty || faculty.role !== "FACULTY") {
      return NextResponse.json(
        { error: "Faculty not found" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("FACULTY_DELETE_ERROR", error);

    return NextResponse.json(
      { error: "Failed to delete faculty" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
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

const departmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(30),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  active: z.boolean().optional(),
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

    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            users: true,
            courses: true,
          },
        },
      },
    });

    return NextResponse.json({
      departments,
    });
  } catch (error) {
    console.error("Departments GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to load departments",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = departmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid department data",
          details: parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const department = await prisma.department.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code.toUpperCase(),
        description:
          parsed.data.description || null,
        active:
          parsed.data.active ?? true,
      },
      include: {
        _count: {
          select: {
            users: true,
            courses: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        department,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Departments POST error:", error);

    return NextResponse.json(
      {
        error: "Failed to create department",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error: "Department ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const parsed = departmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid department data",
          details: parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const department = await prisma.department.update({
      where: {
        id,
      },
      data: {
        name: parsed.data.name,
        code: parsed.data.code.toUpperCase(),
        description:
          parsed.data.description || null,
        ...(parsed.data.active !== undefined
          ? {
              active: parsed.data.active,
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            users: true,
            courses: true,
          },
        },
      },
    });

    return NextResponse.json({
      department,
    });
  } catch (error) {
    console.error("Departments PUT error:", error);

    return NextResponse.json(
      {
        error: "Failed to update department",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
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
        {
          error: "Department ID is required",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.department.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Departments DELETE error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete department",
      },
      {
        status: 500,
      }
    );
  }
}
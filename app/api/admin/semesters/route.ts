import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

const semesterSchema = z.object({
  name: z.string().trim().min(1).max(100),
  number: z.number().int().min(1).max(20),
  courseId: z.string().min(1),
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

    const [semesters, courses] = await Promise.all([
      prisma.semester.findMany({
        orderBy: [
          {
            course: {
              name: "asc",
            },
          },
          {
            number: "asc",
          },
        ],
        include: {
          course: {
            include: {
              department: true,
            },
          },
          _count: {
            select: {
              users: true,
              subjects: true,
            },
          },
        },
      }),

      prisma.course.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
        include: {
          department: true,
        },
      }),
    ]);

    return NextResponse.json({
      semesters,
      courses,
    });
  } catch (error) {
    console.error("GET /api/admin/semesters:", error);

    return NextResponse.json(
      {
        error: "Failed to load semesters",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const data = semesterSchema.parse({
      ...body,
      number: Number(body.number),
    });

    const course = await prisma.course.findUnique({
      where: {
        id: data.courseId,
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          error: "Course not found",
        },
        {
          status: 404,
        }
      );
    }

    const existing = await prisma.semester.findUnique({
      where: {
        courseId_number: {
          courseId: data.courseId,
          number: data.number,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "This semester number already exists for the selected course",
        },
        {
          status: 409,
        }
      );
    }

    const semester = await prisma.semester.create({
      data,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        _count: {
          select: {
            users: true,
            subjects: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        semester,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/admin/semesters:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid semester data",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create semester",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const id = String(body.id || "");

    if (!id) {
      return NextResponse.json(
        {
          error: "Semester ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const data = semesterSchema.parse({
      ...body,
      number: Number(body.number),
    });

    const duplicate = await prisma.semester.findFirst({
      where: {
        courseId: data.courseId,
        number: data.number,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "This semester number already exists for the selected course",
        },
        {
          status: 409,
        }
      );
    }

    const semester = await prisma.semester.update({
      where: {
        id,
      },
      data,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        _count: {
          select: {
            users: true,
            subjects: true,
          },
        },
      },
    });

    return NextResponse.json({
      semester,
    });
  } catch (error) {
    console.error("PUT /api/admin/semesters:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid semester data",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update semester",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "Semester ID is required",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.semester.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/admin/semesters:", error);

    return NextResponse.json(
      {
        error: "Failed to delete semester",
      },
      {
        status: 500,
      }
    );
  }
}
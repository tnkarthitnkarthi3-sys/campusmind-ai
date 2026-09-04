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

const subjectSchema = z.object({
  name: z.string().trim().min(1).max(150),
  code: z.string().trim().min(1).max(50),
  credits: z.number().int().min(1).max(20),
  courseId: z.string().min(1),
  semesterId: z.string().min(1),
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

    const [subjects, courses, semesters] = await Promise.all([
      prisma.subject.findMany({
        orderBy: {
          name: "asc",
        },
        include: {
          course: {
            include: {
              department: true,
            },
          },
          semester: true,
          faculty: {
            include: {
              faculty: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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

      prisma.semester.findMany({
        where: {
          active: true,
        },
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
          course: true,
        },
      }),
    ]);

    return NextResponse.json({
      subjects,
      courses,
      semesters,
    });
  } catch (error) {
    console.error("GET /api/admin/subjects:", error);

    return NextResponse.json(
      {
        error: "Failed to load subjects",
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

    const data = subjectSchema.parse({
      ...body,
      credits: Number(body.credits),
    });

    const [course, semester] = await Promise.all([
      prisma.course.findUnique({
        where: {
          id: data.courseId,
        },
      }),

      prisma.semester.findUnique({
        where: {
          id: data.semesterId,
        },
      }),
    ]);

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

    if (!semester) {
      return NextResponse.json(
        {
          error: "Semester not found",
        },
        {
          status: 404,
        }
      );
    }

    if (semester.courseId !== course.id) {
      return NextResponse.json(
        {
          error:
            "Selected semester does not belong to the selected course",
        },
        {
          status: 400,
        }
      );
    }

    const existing = await prisma.subject.findUnique({
      where: {
        code: data.code,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Subject code already exists",
        },
        {
          status: 409,
        }
      );
    }

    const subject = await prisma.subject.create({
      data,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
        faculty: true,
      },
    });

    return NextResponse.json(
      {
        subject,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/admin/subjects:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid subject data",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create subject",
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
          error: "Subject ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const data = subjectSchema.parse({
      ...body,
      credits: Number(body.credits),
    });

    const [course, semester] = await Promise.all([
      prisma.course.findUnique({
        where: {
          id: data.courseId,
        },
      }),

      prisma.semester.findUnique({
        where: {
          id: data.semesterId,
        },
      }),
    ]);

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

    if (!semester) {
      return NextResponse.json(
        {
          error: "Semester not found",
        },
        {
          status: 404,
        }
      );
    }

    if (semester.courseId !== course.id) {
      return NextResponse.json(
        {
          error:
            "Selected semester does not belong to the selected course",
        },
        {
          status: 400,
        }
      );
    }

    const duplicate = await prisma.subject.findFirst({
      where: {
        code: data.code,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error: "Subject code already exists",
        },
        {
          status: 409,
        }
      );
    }

    const subject = await prisma.subject.update({
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
        semester: true,
        faculty: true,
      },
    });

    return NextResponse.json({
      subject,
    });
  } catch (error) {
    console.error("PUT /api/admin/subjects:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid subject data",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update subject",
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
          error: "Subject ID is required",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.subject.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/admin/subjects:", error);

    return NextResponse.json(
      {
        error: "Failed to delete subject",
      },
      {
        status: 500,
      }
    );
  }
}
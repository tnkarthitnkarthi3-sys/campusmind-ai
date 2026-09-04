import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function requireAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

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

const assignmentSchema = z.object({
  subjectId: z.string().min(1),
});

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const faculty = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
      },
    });

    if (!faculty || faculty.role !== "FACULTY") {
      return NextResponse.json(
        { error: "Faculty not found" },
        { status: 404 }
      );
    }

    const assignedSubjects = await prisma.subjectFaculty.findMany({
      where: {
        facultyId: id,
      },
      select: {
        id: true,
        createdAt: true,
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
            active: true,
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const subjects = await prisma.subject.findMany({
      where: {
        active: true,
        ...(faculty.departmentId
          ? {
              course: {
                departmentId: faculty.departmentId,
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        code: true,
        credits: true,
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
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
      orderBy: [
        {
          course: {
            name: "asc",
          },
        },
        {
          semester: {
            number: "asc",
          },
        },
        {
          name: "asc",
        },
      ],
    });

    return NextResponse.json({
      faculty,
      assignedSubjects,
      subjects,
    });
  } catch (error) {
    console.error("FACULTY_SUBJECTS_GET_ERROR", error);

    return NextResponse.json(
      {
        error: "Failed to load faculty subjects",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    const data = assignmentSchema.parse(body);

    const faculty = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        role: true,
        departmentId: true,
      },
    });

    if (!faculty || faculty.role !== "FACULTY") {
      return NextResponse.json(
        {
          error: "Faculty not found",
        },
        {
          status: 404,
        }
      );
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: data.subjectId,
      },
      select: {
        id: true,
        active: true,
        course: {
          select: {
            departmentId: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        {
          error: "Subject not found",
        },
        {
          status: 404,
        }
      );
    }

    if (!subject.active) {
      return NextResponse.json(
        {
          error: "Inactive subjects cannot be assigned",
        },
        {
          status: 400,
        }
      );
    }

    if (
      faculty.departmentId &&
      subject.course.departmentId !== faculty.departmentId
    ) {
      return NextResponse.json(
        {
          error:
            "Faculty can only be assigned subjects from their department",
        },
        {
          status: 400,
        }
      );
    }

    const existing = await prisma.subjectFaculty.findUnique({
      where: {
        subjectId_facultyId: {
          subjectId: data.subjectId,
          facultyId: id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Subject is already assigned to this faculty",
        },
        {
          status: 409,
        }
      );
    }

    const assignment = await prisma.subjectFaculty.create({
      data: {
        subjectId: data.subjectId,
        facultyId: id,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        assignment,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("FACULTY_SUBJECT_ASSIGN_ERROR", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid assignment data",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to assign subject",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    const subjectId = String(body.subjectId || "");

    if (!subjectId) {
      return NextResponse.json(
        {
          error: "Subject ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const assignment = await prisma.subjectFaculty.findUnique({
      where: {
        subjectId_facultyId: {
          subjectId,
          facultyId: id,
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        {
          error: "Assignment not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.subjectFaculty.delete({
      where: {
        subjectId_facultyId: {
          subjectId,
          facultyId: id,
        },
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("FACULTY_SUBJECT_DELETE_ERROR", error);

    return NextResponse.json(
      {
        error: "Failed to remove subject assignment",
      },
      {
        status: 500,
      }
    );
  }
}
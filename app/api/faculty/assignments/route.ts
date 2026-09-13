import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function getFaculty() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      departmentId: true,
    },
  });

  if (!user || user.role !== "FACULTY") {
    return null;
  }

  return user;
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function normalizePriority(value: unknown) {
  const priority = String(value || "MEDIUM").toUpperCase();

  if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
    return null;
  }

  return priority;
}

function normalizeStatus(value: unknown) {
  const status = String(value || "PUBLISHED").toUpperCase();

  if (!["DRAFT", "PUBLISHED", "CLOSED"].includes(status)) {
    return null;
  }

  return status;
}

/**
 * GET
 * Faculty can only see assignments created by that faculty member.
 */
export async function GET(request: NextRequest) {
  try {
    const faculty = await getFaculty();

    if (!faculty) {
      return errorResponse("Faculty authentication required.", 401);
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    const assignments = await prisma.campusAcademicAssignment.findMany({
      where: {
        facultyId: faculty.id,
        active: true,
        ...(subjectId ? { subjectId } : {}),
      },
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    const subjectIds = [
      ...new Set(assignments.map((assignment) => assignment.subjectId)),
    ];

    const subjects =
      subjectIds.length > 0
        ? await prisma.subject.findMany({
            where: {
              id: {
                in: subjectIds,
              },
            },
            select: {
              id: true,
              name: true,
              code: true,
            },
          })
        : [];

    const subjectMap = new Map(
      subjects.map((subject) => [subject.id, subject]),
    );

    const result = assignments.map((assignment) => ({
      ...assignment,
      subject: subjectMap.get(assignment.subjectId) || null,
    }));

    return NextResponse.json({
      success: true,
      assignments: result,
    });
  } catch (error) {
    console.error("FACULTY ASSIGNMENTS GET ERROR:", error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to load faculty assignments.",
      500,
    );
  }
}

/**
 * POST
 * Faculty can create assignments only for subjects assigned to them.
 */
export async function POST(request: NextRequest) {
  try {
    const faculty = await getFaculty();

    if (!faculty) {
      return errorResponse("Faculty authentication required.", 401);
    }

    if (!faculty.departmentId) {
      return errorResponse(
        "Faculty department is not configured.",
        400,
      );
    }

    const body = await request.json();

    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim();
    const instructions = String(body?.instructions || "").trim();

    const subjectId = String(body?.subjectId || "").trim();

    const dueDate = normalizeDate(body?.dueDate);

    const totalMarks = Number(body?.totalMarks ?? 10);

    const priority = normalizePriority(body?.priority);
    const status = normalizeStatus(body?.status);

    if (!title) {
      return errorResponse("Assignment title is required.");
    }

    if (!subjectId) {
      return errorResponse("Subject is required.");
    }

    if (!dueDate) {
      return errorResponse("A valid due date is required.");
    }

    if (!Number.isInteger(totalMarks) || totalMarks <= 0) {
      return errorResponse(
        "Total marks must be a positive whole number.",
      );
    }

    if (!priority) {
      return errorResponse(
        "Priority must be LOW, MEDIUM, or HIGH.",
      );
    }

    if (!status) {
      return errorResponse(
        "Status must be DRAFT, PUBLISHED, or CLOSED.",
      );
    }

    const facultySubject =
      await prisma.subjectFaculty.findFirst({
        where: {
          facultyId: faculty.id,
          subjectId,
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              courseId: true,
              semesterId: true,
            },
          },
        },
      });

    if (!facultySubject) {
      return errorResponse(
        "You can only create assignments for subjects assigned to you.",
        403,
      );
    }

    const assignment =
      await prisma.campusAcademicAssignment.create({
        data: {
          title,
          description: description || null,
          instructions: instructions || null,

          departmentId: faculty.departmentId,

          courseId: facultySubject.subject.courseId,
          semesterId: facultySubject.subject.semesterId,
          subjectId: facultySubject.subject.id,

          facultyId: faculty.id,

          assignedDate: new Date(),
          dueDate,

          totalMarks,

          priority,
          status,

          active: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Assignment created successfully.",
        assignment: {
          ...assignment,
          subject: facultySubject.subject,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("FACULTY ASSIGNMENTS POST ERROR:", error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to create assignment.",
      500,
    );
  }
}

/**
 * PATCH
 * Faculty can edit only their own assignments.
 */
export async function PATCH(request: NextRequest) {
  try {
    const faculty = await getFaculty();

    if (!faculty) {
      return errorResponse("Faculty authentication required.", 401);
    }

    const body = await request.json();

    const id = String(body?.id || "").trim();

    if (!id) {
      return errorResponse("Assignment id is required.");
    }

    const existing =
      await prisma.campusAcademicAssignment.findFirst({
        where: {
          id,
          facultyId: faculty.id,
          active: true,
        },
      });

    if (!existing) {
      return errorResponse(
        "Assignment not found or you do not have permission to edit it.",
        404,
      );
    }

    const data: {
      title?: string;
      description?: string | null;
      instructions?: string | null;
      dueDate?: Date;
      totalMarks?: number;
      priority?: string;
      status?: string;
    } = {};

    if (body?.title !== undefined) {
      const title = String(body.title || "").trim();

      if (!title) {
        return errorResponse("Assignment title cannot be empty.");
      }

      data.title = title;
    }

    if (body?.description !== undefined) {
      const description = String(body.description || "").trim();

      data.description = description || null;
    }

    if (body?.instructions !== undefined) {
      const instructions = String(
        body.instructions || "",
      ).trim();

      data.instructions = instructions || null;
    }

    if (body?.dueDate !== undefined) {
      const dueDate = normalizeDate(body.dueDate);

      if (!dueDate) {
        return errorResponse("Invalid due date.");
      }

      data.dueDate = dueDate;
    }

    if (body?.totalMarks !== undefined) {
      const totalMarks = Number(body.totalMarks);

      if (!Number.isInteger(totalMarks) || totalMarks <= 0) {
        return errorResponse(
          "Total marks must be a positive whole number.",
        );
      }

      data.totalMarks = totalMarks;
    }

    if (body?.priority !== undefined) {
      const priority = normalizePriority(body.priority);

      if (!priority) {
        return errorResponse("Invalid priority.");
      }

      data.priority = priority;
    }

    if (body?.status !== undefined) {
      const status = normalizeStatus(body.status);

      if (!status) {
        return errorResponse("Invalid assignment status.");
      }

      data.status = status;
    }

    const updated =
      await prisma.campusAcademicAssignment.update({
        where: {
          id: existing.id,
        },
        data,
      });

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully.",
      assignment: updated,
    });
  } catch (error) {
    console.error("FACULTY ASSIGNMENTS PATCH ERROR:", error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to update assignment.",
      500,
    );
  }
}

/**
 * DELETE
 * Soft-delete only assignments owned by the current faculty.
 */
export async function DELETE(request: NextRequest) {
  try {
    const faculty = await getFaculty();

    if (!faculty) {
      return errorResponse("Faculty authentication required.", 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Assignment id is required.");
    }

    const existing =
      await prisma.campusAcademicAssignment.findFirst({
        where: {
          id,
          facultyId: faculty.id,
          active: true,
        },
      });

    if (!existing) {
      return errorResponse(
        "Assignment not found or you do not have permission to delete it.",
        404,
      );
    }

    await prisma.campusAcademicAssignment.update({
      where: {
        id: existing.id,
      },
      data: {
        active: false,
        status: "CLOSED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.error("FACULTY ASSIGNMENTS DELETE ERROR:", error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to delete assignment.",
      500,
    );
  }
}

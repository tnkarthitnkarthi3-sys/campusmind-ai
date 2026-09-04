import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createNotifications,
  notifyStudentsByAcademicContext,
} from "@/lib/notifications";

const noteSchema = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(1),
  noteType: z.string().trim().min(1).max(50).default("LECTURE"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  active: z.boolean().default(true),

  departmentId: z.string().min(1),
  courseId: z.string().min(1),
  semesterId: z.string().min(1),
  subjectId: z.string().min(1),

  facultyId: z.string().nullable().optional(),

  fileUrl: z.string().trim().url().nullable().optional(),
  fileName: z.string().trim().max(255).nullable().optional(),
  fileType: z.string().trim().max(100).nullable().optional(),
  fileSize: z.number().int().nonnegative().nullable().optional(),
});

async function getAdmin(request: NextRequest) {
  const userId = request.cookies.get("campusmind_user_id")?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

async function validateAcademicStructure(input: {
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  facultyId?: string | null;
}) {
  const department = await prisma.department.findFirst({
    where: {
      id: input.departmentId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  if (!department) {
    throw new Error("Invalid department");
  }

  const course = await prisma.course.findFirst({
    where: {
      id: input.courseId,
      departmentId: input.departmentId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  if (!course) {
    throw new Error("Invalid course for selected department");
  }

  const semester = await prisma.semester.findFirst({
    where: {
      id: input.semesterId,
      courseId: input.courseId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      number: true,
    },
  });

  if (!semester) {
    throw new Error("Invalid semester for selected course");
  }

  const subject = await prisma.subject.findFirst({
    where: {
      id: input.subjectId,
      courseId: input.courseId,
      semesterId: input.semesterId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  if (!subject) {
    throw new Error("Invalid subject for selected semester");
  }

  if (input.facultyId) {
    const faculty = await prisma.user.findFirst({
      where: {
        id: input.facultyId,
        role: "FACULTY",
        ...(input.departmentId
          ? { departmentId: input.departmentId }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!faculty) {
      throw new Error("Invalid faculty");
    }
  }

  return {
    department,
    course,
    semester,
    subject,
  };
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notes = await prisma.campusAcademicNote.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const [departments, courses, semesters, subjects, faculty] =
      await Promise.all([
        prisma.department.findMany({
          where: { active: true },
          orderBy: { name: "asc" },
        }),

        prisma.course.findMany({
          where: { active: true },
          orderBy: { name: "asc" },
        }),

        prisma.semester.findMany({
          where: { active: true },
          orderBy: [
            { courseId: "asc" },
            { number: "asc" },
          ],
        }),

        prisma.subject.findMany({
          where: { active: true },
          orderBy: { name: "asc" },
        }),

        prisma.user.findMany({
          where: {
            role: "FACULTY",
          },
          select: {
            id: true,
            name: true,
            email: true,
            departmentId: true,
          },
          orderBy: {
            name: "asc",
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      notes,
      departments,
      courses,
      semesters,
      subjects,
      faculty,
    });
  } catch (error) {
    console.error("GET /api/admin/notes error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load notes",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const input = noteSchema.parse(body);

    await validateAcademicStructure(input);

    const isPublished =
      input.status === "PUBLISHED" && input.active === true;

    const note = await prisma.campusAcademicNote.create({
      data: {
        title: input.title,
        content: input.content,
        noteType: input.noteType,
        status: input.status,
        active: input.active,

        departmentId: input.departmentId,
        courseId: input.courseId,
        semesterId: input.semesterId,
        subjectId: input.subjectId,
        facultyId: input.facultyId ?? null,

        fileUrl: input.fileUrl ?? null,
        fileName: input.fileName ?? null,
        fileType: input.fileType ?? null,
        fileSize: input.fileSize ?? null,

        publishedAt: isPublished ? new Date() : null,
      },
    });

    if (isPublished) {
      try {
        await notifyStudentsByAcademicContext({
          departmentId: input.departmentId,
          courseId: input.courseId,
          semesterId: input.semesterId,
          title: "New Study Material",
          message: `${input.title} has been published for your academic section.`,
          type: "NOTE",
          link: "/notes",
        });
      } catch (notificationError) {
        console.error(
          "Note notification failed:",
          notificationError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: isPublished
          ? "Study material published successfully"
          : "Study material saved as draft",
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/notes error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid note data",
          errors: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create note",
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const idSchema = z.object({
      id: z.string().min(1),
    });

    const { id } = idSchema.parse(body);

    const input = noteSchema.parse(body);

    await validateAcademicStructure(input);

    const existing = await prisma.campusAcademicNote.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found",
        },
        { status: 404 }
      );
    }

    const wasPublished =
      existing.status === "PUBLISHED" && existing.active === true;

    const isPublished =
      input.status === "PUBLISHED" && input.active === true;

    const shouldNotify = !wasPublished && isPublished;

    const note = await prisma.campusAcademicNote.update({
      where: { id },
      data: {
        title: input.title,
        content: input.content,
        noteType: input.noteType,
        status: input.status,
        active: input.active,

        departmentId: input.departmentId,
        courseId: input.courseId,
        semesterId: input.semesterId,
        subjectId: input.subjectId,
        facultyId: input.facultyId ?? null,

        fileUrl: input.fileUrl ?? null,
        fileName: input.fileName ?? null,
        fileType: input.fileType ?? null,
        fileSize: input.fileSize ?? null,

        publishedAt: isPublished
          ? existing.publishedAt ?? new Date()
          : null,
      },
    });

    if (shouldNotify) {
      try {
        await notifyStudentsByAcademicContext({
          departmentId: input.departmentId,
          courseId: input.courseId,
          semesterId: input.semesterId,
          title: "New Study Material",
          message: `${input.title} has been published for your academic section.`,
          type: "NOTE",
          link: "/notes",
        });
      } catch (notificationError) {
        console.error(
          "Note notification failed:",
          notificationError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Study material updated successfully",
      note,
    });
  } catch (error) {
    console.error("PUT /api/admin/notes error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid note data",
          errors: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update note",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Note ID is required",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.campusAcademicNote.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found",
        },
        { status: 404 }
      );
    }

    await prisma.campusAcademicNote.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Study material deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/notes error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete note",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function requireFaculty() {
  const cookieStore = await cookies();

  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      departmentId: true,
    },
  });

  if (!user || user.role !== "FACULTY") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const faculty = await requireFaculty();

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: "Faculty access required" },
        { status: 403 }
      );
    }

    const notes = await prisma.campusAcademicNote.findMany({
      where: {
        facultyId: faculty.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Faculty notes GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load faculty notes",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const faculty = await requireFaculty();

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: "Faculty access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();
    const departmentId = String(body.departmentId ?? "").trim();
    const courseId = String(body.courseId ?? "").trim();
    const semesterId = String(body.semesterId ?? "").trim();
    const subjectId = String(body.subjectId ?? "").trim();

    const noteType =
      String(body.noteType ?? "LECTURE").trim() || "LECTURE";

    const status =
      String(body.status ?? "DRAFT").trim() || "DRAFT";

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    const fileUrl =
      body.fileUrl
        ? String(body.fileUrl).trim()
        : null;

    const fileName =
      body.fileName
        ? String(body.fileName).trim()
        : null;

    const fileType =
      body.fileType
        ? String(body.fileType).trim()
        : null;

    const fileSize =
      typeof body.fileSize === "number"
        ? body.fileSize
        : null;

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and content are required",
        },
        { status: 400 }
      );
    }

    if (
      !departmentId ||
      !courseId ||
      !semesterId ||
      !subjectId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Department, course, semester and subject are required",
        },
        { status: 400 }
      );
    }

    if (
      faculty.departmentId &&
      faculty.departmentId !== departmentId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Faculty can only create notes for their department",
        },
        { status: 403 }
      );
    }

    if (
      status !== "DRAFT" &&
      status !== "PUBLISHED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid note status",
        },
        { status: 400 }
      );
    }

    if (
      fileType &&
      fileType !== "application/pdf"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF files are supported",
        },
        { status: 400 }
      );
    }

    if (
      fileSize !== null &&
      fileSize > 10 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "PDF must be 10 MB or smaller",
        },
        { status: 400 }
      );
    }

    const department =
      await prisma.department.findFirst({
        where: {
          id: departmentId,
          active: true,
        },
      });

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid department",
        },
        { status: 400 }
      );
    }

    const course =
      await prisma.course.findFirst({
        where: {
          id: courseId,
          departmentId,
          active: true,
        },
      });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected course does not belong to department",
        },
        { status: 400 }
      );
    }

    const semester =
      await prisma.semester.findFirst({
        where: {
          id: semesterId,
          courseId,
          active: true,
        },
      });

    if (!semester) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected semester does not belong to course",
        },
        { status: 400 }
      );
    }

    const subject =
      await prisma.subject.findFirst({
        where: {
          id: subjectId,
          courseId,
          semesterId,
          active: true,
        },
      });

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected subject does not belong to semester",
        },
        { status: 400 }
      );
    }

    const note =
      await prisma.campusAcademicNote.create({
        data: {
          title,
          content,
          noteType,
          status,
          active,
          departmentId,
          courseId,
          semesterId,
          subjectId,
          facultyId: faculty.id,
          publishedAt:
            status === "PUBLISHED"
              ? new Date()
              : null,
          fileUrl,
          fileName,
          fileType,
          fileSize,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          status === "PUBLISHED"
            ? "Note published successfully"
            : "Note saved successfully",
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Faculty notes POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create note",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const faculty = await requireFaculty();

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: "Faculty access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = String(body.id ?? "").trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Note ID is required",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.campusAcademicNote.findFirst({
        where: {
          id,
          facultyId: faculty.id,
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

    const title =
      body.title !== undefined
        ? String(body.title).trim()
        : existing.title;

    const content =
      body.content !== undefined
        ? String(body.content).trim()
        : existing.content;

    const noteType =
      body.noteType !== undefined
        ? String(body.noteType).trim()
        : existing.noteType;

    const status =
      body.status !== undefined
        ? String(body.status).trim()
        : existing.status;

    const active =
      typeof body.active === "boolean"
        ? body.active
        : existing.active;

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and content are required",
        },
        { status: 400 }
      );
    }

    const note =
      await prisma.campusAcademicNote.update({
        where: {
          id: existing.id,
        },
        data: {
          title,
          content,
          noteType,
          status,
          active,
          publishedAt:
            status === "PUBLISHED"
              ? existing.publishedAt ?? new Date()
              : null,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Faculty notes PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update note",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const faculty = await requireFaculty();

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: "Faculty access required" },
        { status: 403 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Note ID is required",
        },
        { status: 400 }
      );
    }

    const note =
      await prisma.campusAcademicNote.findFirst({
        where: {
          id,
          facultyId: faculty.id,
        },
        select: {
          id: true,
        },
      });

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found",
        },
        { status: 404 }
      );
    }

    await prisma.campusAcademicNote.delete({
      where: {
        id: note.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(
      "Faculty notes DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete note",
      },
      { status: 500 }
    );
  }
}

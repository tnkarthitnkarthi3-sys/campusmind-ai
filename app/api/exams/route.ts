import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const examSchema = z.object({
  subject: z.string().min(2).max(100),
  examDate: z.string().min(1),
  description: z.string().max(2000).optional(),
});

async function getCurrentUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("campusmind_user_id")?.value ?? null;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const exams = await prisma.exam.findMany({
      where: { userId },
      orderBy: { examDate: "asc" },
    });

    const now = new Date();

    const upcoming = exams.filter(
      (exam) => new Date(exam.examDate) >= now
    );

    const completed = exams.filter(
      (exam) => new Date(exam.examDate) < now
    );

    return NextResponse.json({
      success: true,
      summary: {
        total: exams.length,
        upcoming: upcoming.length,
        completed: completed.length,
      },
      exams,
    });
  } catch (error) {
    console.error("Exams GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load exams",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = examSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid exam data",
        },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        userId,
        subject: parsed.data.subject.trim(),
        examDate: new Date(parsed.data.examDate),
        description:
          parsed.data.description?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Exam added successfully",
        exam,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Exams POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add exam",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = examSchema
      .extend({
        id: z.string().min(1),
      })
      .safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid exam data",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.exam.findFirst({
      where: {
        id: parsed.data.id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Exam not found",
        },
        { status: 404 }
      );
    }

    const exam = await prisma.exam.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        subject: parsed.data.subject.trim(),
        examDate: new Date(parsed.data.examDate),
        description:
          parsed.data.description?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    console.error("Exams PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update exam",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const id = new URL(request.url).searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Exam ID is required",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.exam.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Exam not found",
        },
        { status: 404 }
      );
    }

    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Exams DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete exam",
      },
      { status: 500 }
    );
  }
}

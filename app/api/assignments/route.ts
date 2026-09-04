import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const assignmentSchema = z.object({
  title: z.string().min(2).max(150),
  subject: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        userId,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    const total = assignments.length;
    const pending = assignments.filter(
      (item) => item.status === "PENDING"
    ).length;
    const inProgress = assignments.filter(
      (item) => item.status === "IN_PROGRESS"
    ).length;
    const completed = assignments.filter(
      (item) => item.status === "COMPLETED"
    ).length;

    const now = new Date();

    const overdue = assignments.filter(
      (item) =>
        item.status !== "COMPLETED" &&
        new Date(item.dueDate) < now
    ).length;

    return NextResponse.json({
      success: true,
      summary: {
        total,
        pending,
        inProgress,
        completed,
        overdue,
      },
      assignments,
    });
  } catch (error) {
    console.error("Assignments GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load assignments",
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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = assignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assignment data",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        userId,
        title: parsed.data.title.trim(),
        subject: parsed.data.subject.trim(),
        description: parsed.data.description?.trim() || null,
        dueDate: new Date(parsed.data.dueDate),
        status: parsed.data.status,
        priority: parsed.data.priority,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Assignment added successfully",
        assignment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Assignments POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add assignment",
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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = assignmentSchema
      .extend({
        id: z.string().min(1),
      })
      .safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assignment data",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.assignment.findFirst({
      where: {
        id: parsed.data.id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found",
        },
        { status: 404 }
      );
    }

    const assignment = await prisma.assignment.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        title: parsed.data.title.trim(),
        subject: parsed.data.subject.trim(),
        description: parsed.data.description?.trim() || null,
        dueDate: new Date(parsed.data.dueDate),
        status: parsed.data.status,
        priority: parsed.data.priority,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Assignments PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update assignment",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment ID is required",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.assignment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found",
        },
        { status: 404 }
      );
    }

    await prisma.assignment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Assignments DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete assignment",
      },
      { status: 500 }
    );
  }
}

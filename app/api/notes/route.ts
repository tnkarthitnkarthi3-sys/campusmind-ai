import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const noteSchema = z.object({
  title: z.string().min(2).max(150),
  subject: z.string().min(2).max(100),
  content: z.string().min(1).max(10000),
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

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    const subjects = Array.from(
      new Set(notes.map((note) => note.subject))
    );

    return NextResponse.json({
      success: true,
      summary: {
        total: notes.length,
        subjects: subjects.length,
      },
      notes,
    });
  } catch (error) {
    console.error("Notes GET error:", error);

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
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid note data",
        },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        userId,
        title: parsed.data.title.trim(),
        subject: parsed.data.subject.trim(),
        content: parsed.data.content.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully",
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Notes POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create note",
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

    const parsed = noteSchema
      .extend({
        id: z.string().min(1),
      })
      .safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid note data",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.note.findFirst({
      where: {
        id: parsed.data.id,
        userId,
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

    const note = await prisma.note.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        title: parsed.data.title.trim(),
        subject: parsed.data.subject.trim(),
        content: parsed.data.content.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Notes PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update note",
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
          message: "Note ID is required",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.note.findFirst({
      where: {
        id,
        userId,
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

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Notes DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete note",
      },
      { status: 500 }
    );
  }
}

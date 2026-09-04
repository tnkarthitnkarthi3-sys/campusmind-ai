import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        departmentId: true,
        courseId: true,
        semesterId: true,
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Student access required" },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    const note = await prisma.campusAcademicNote.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        active: true,
        departmentId: true,
        courseId: true,
        semesterId: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        fileSize: true,
      },
    });

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 },
      );
    }

    if (note.status !== "PUBLISHED" || !note.active) {
      return NextResponse.json(
        { success: false, error: "This note is not available" },
        { status: 403 },
      );
    }

    if (!note.fileUrl) {
      return NextResponse.json(
        { success: false, error: "No PDF attachment is available" },
        { status: 404 },
      );
    }

    const hasAcademicAccess =
      note.departmentId === student.departmentId &&
      note.courseId === student.courseId &&
      note.semesterId === student.semesterId;

    if (!hasAcademicAccess) {
      return NextResponse.json(
        { success: false, error: "You do not have access to this note" },
        { status: 403 },
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from("campusmind-notes")
      .createSignedUrl(note.fileUrl, 300);

    if (error || !data?.signedUrl) {
      console.error("Failed to create signed PDF URL:", error);

      return NextResponse.json(
        { success: false, error: "Unable to generate PDF access URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        url: data.signedUrl,
        fileName: note.fileName,
        fileType: note.fileType,
        fileSize: note.fileSize,
        expiresIn: 300,
      },
    });
  } catch (error) {
    console.error("Student note download error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
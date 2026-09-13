import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const note = await prisma.campusAcademicNote.findUnique({
      where: { id },
    });

    if (!note || !note.active) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    if (!note.fileUrl) {
      return NextResponse.json(
        { success: false, error: "This note has no attachment" },
        { status: 404 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const fileUrl = note.fileUrl;

    if (
      fileUrl.startsWith("http://") ||
      fileUrl.startsWith("https://")
    ) {
      return NextResponse.redirect(fileUrl);
    }

    const cleanPath = fileUrl.replace(/^\/+/, "");

    const { data, error } = await supabaseAdmin.storage
      .from("official-notes")
      .createSignedUrl(cleanPath, 60 * 10);

    if (error || !data?.signedUrl) {
      console.error("SUPABASE SIGNED URL ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to generate download link",
        },
        { status: 500 }
      );
    }

    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error("OFFICIAL NOTE DOWNLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Download failed",
      },
      { status: 500 }
    );
  }
}

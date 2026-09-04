import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("GET /api/departments error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load departments",
      },
      { status: 500 }
    );
  }
}
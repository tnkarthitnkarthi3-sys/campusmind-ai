import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
});

async function getAuthenticatedFaculty() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) {
    return null;
  }

  const faculty = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      facultySubjects: {
        select: {
          id: true,
          subject: {
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
      },
    },
  });

  if (!faculty || faculty.role !== "FACULTY") {
    return null;
  }

  return faculty;
}

export async function GET() {
  try {
    const faculty = await getAuthenticatedFaculty();

    if (!faculty) {
      return NextResponse.json(
        {
          success: false,
          error: "Faculty authentication required",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      faculty,
    });
  } catch (error) {
    console.error("Faculty profile GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load faculty profile",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const faculty = await getAuthenticatedFaculty();

    if (!faculty) {
      return NextResponse.json(
        {
          success: false,
          error: "Faculty authentication required",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.issues[0]?.message ?? "Invalid profile data",
        },
        { status: 400 },
      );
    }

    const updatedFaculty = await prisma.user.update({
      where: {
        id: faculty.id,
      },
      data: {
        name: result.data.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        facultySubjects: {
          select: {
            id: true,
            subject: {
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
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Faculty profile updated successfully",
      faculty: updatedFaculty,
    });
  } catch (error) {
    console.error("Faculty profile PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update faculty profile",
      },
      { status: 500 },
    );
  }
}
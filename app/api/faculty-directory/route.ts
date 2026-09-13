import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query =
      searchParams.get("q")?.trim() || "";

    const departmentId =
      searchParams.get("departmentId")?.trim() || "";

    const where: any = {
      role: "FACULTY",
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (query) {
      where.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    const faculty = await prisma.user.findMany({
      where,

      select: {
        id: true,
        name: true,
        email: true,

        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },

        facultySubjects: {
          select: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },

      orderBy: {
        name: "asc",
      },

      take: 100,
    });

    const departments =
      await prisma.department.findMany({
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

    const formattedFaculty = faculty.map(
      (member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        department: member.department,
        subjects: member.facultySubjects.map(
          (item) => item.subject
        ),
      })
    );

    return NextResponse.json({
      success: true,
      faculty: formattedFaculty,
      departments,
      total: formattedFaculty.length,
    });
  } catch (error) {
    console.error(
      "FACULTY DIRECTORY API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load faculty information",
      },
      {
        status: 500,
      }
    );
  }
}

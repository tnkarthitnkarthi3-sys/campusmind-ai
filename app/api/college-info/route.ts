import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query =
      searchParams.get("q")?.trim() || "";

    const departments =
      await prisma.department.findMany({
        where: {
          active: true,

          ...(query
            ? {
                OR: [
                  {
                    name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    code: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    description: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },

        include: {
          courses: {
            where: {
              active: true,
            },

            select: {
              id: true,
              name: true,
              code: true,
              durationYears: true,
            },

            orderBy: {
              name: "asc",
            },
          },
        },

        orderBy: {
          name: "asc",
        },

        take: 50,
      });

    const college =
      await prisma.collegeInfo.findFirst();

    return NextResponse.json({
      success: true,
      college,
      departments,
      query,
    });
  } catch (error) {
    console.error(
      "COLLEGE INFO API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load college information",
      },
      {
        status: 500,
      }
    );
  }
}

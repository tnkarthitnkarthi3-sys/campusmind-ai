import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createNotifications } from "@/lib/notifications";

const announcementSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(5),
  category: z.string().min(1),
  target: z.string().min(1),
  targetValue: z.string().optional().nullable(),
  published: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

async function requireAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

/* =========================================================
   FIND STUDENTS FOR ANNOUNCEMENT TARGET
   ========================================================= */

async function getAnnouncementStudentIds(
  target: string,
  targetValue?: string | null
) {
  const normalizedTarget = target.trim().toUpperCase();

  const where =
    normalizedTarget === "ALL"
      ? {
          role: "STUDENT" as const,
        }
      : normalizedTarget === "DEPARTMENT"
        ? {
            role: "STUDENT" as const,
            ...(targetValue
              ? {
                  departmentId: targetValue,
                }
              : {}),
          }
        : normalizedTarget === "COURSE"
          ? {
              role: "STUDENT" as const,
              ...(targetValue
                ? {
                    courseId: targetValue,
                  }
                : {}),
            }
          : normalizedTarget === "SEMESTER"
            ? {
                role: "STUDENT" as const,
                ...(targetValue
                  ? {
                      semesterId: targetValue,
                    }
                  : {}),
              }
            : null;

  if (!where) {
    console.warn(
      `Unknown announcement target: ${normalizedTarget}`
    );

    return [];
  }

  if (
    normalizedTarget !== "ALL" &&
    !targetValue
  ) {
    console.warn(
      `Announcement target ${normalizedTarget} has no targetValue`
    );

    return [];
  }

  const students = await prisma.user.findMany({
    where,
    select: {
      id: true,
    },
  });

  return students.map((student) => student.id);
}

/* =========================================================
   SEND ANNOUNCEMENT NOTIFICATIONS
   ========================================================= */

async function notifyAnnouncementStudents(input: {
  announcementId: string;
  title: string;
  content: string;
  category: string;
  target: string;
  targetValue?: string | null;
}) {
  try {
    const studentIds = await getAnnouncementStudentIds(
      input.target,
      input.targetValue
    );

    if (studentIds.length === 0) {
      return {
        success: true,
        count: 0,
      };
    }

    const result = await createNotifications(
      studentIds,
      {
        title: input.title,
        message: input.content,
        type: "ANNOUNCEMENT",
        link: "/announcements",
      }
    );

    console.log(
      `Announcement notification sent: ${result.count} students`
    );

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error(
      "Announcement notification error:",
      error
    );

    /*
      Notification failure must NOT make the
      announcement creation/update fail.
    */

    return {
      success: false,
      count: 0,
    };
  }
}

/* =========================================================
   GET
   ========================================================= */

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const announcements =
      await prisma.announcement.findMany({
        orderBy: [
          {
            published: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error(
      "Admin announcements GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load announcements",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   ========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const data = announcementSchema.parse(body);

    const published = data.published;

    const announcement =
      await prisma.announcement.create({
        data: {
          title: data.title.trim(),
          content: data.content.trim(),
          category: data.category.trim(),
          target: data.target.trim().toUpperCase(),
          targetValue:
            data.targetValue?.trim() || null,

          published,

          publishedAt: published
            ? data.publishedAt
              ? new Date(data.publishedAt)
              : new Date()
            : null,

          expiresAt: data.expiresAt
            ? new Date(data.expiresAt)
            : null,
        },
      });

    /* =====================================================
       AUTOMATIC STUDENT NOTIFICATION
       Only published announcements notify students.
       ===================================================== */

    let notificationCount = 0;

    if (announcement.published) {
      const notificationResult =
        await notifyAnnouncementStudents({
          announcementId: announcement.id,
          title: announcement.title,
          content: announcement.content,
          category: announcement.category,
          target: announcement.target,
          targetValue: announcement.targetValue,
        });

      notificationCount =
        notificationResult.count;
    }

    return NextResponse.json(
      {
        success: true,
        announcement,
        notification: {
          sent: notificationCount > 0,
          count: notificationCount,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Admin announcements POST error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid announcement data",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create announcement",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PUT
   ========================================================= */

export async function PUT(
  request: NextRequest
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const id = z
      .string()
      .min(1)
      .parse(body.id);

    const data =
      announcementSchema.parse(body);

    const existing =
      await prisma.announcement.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Announcement not found",
        },
        {
          status: 404,
        }
      );
    }

    const published =
      data.published;

    const wasPreviouslyPublished =
      existing.published;

    const announcement =
      await prisma.announcement.update({
        where: {
          id,
        },

        data: {
          title: data.title.trim(),
          content: data.content.trim(),
          category: data.category.trim(),
          target: data.target.trim().toUpperCase(),
          targetValue:
            data.targetValue?.trim() || null,

          published,

          publishedAt: published
            ? existing.publishedAt ??
              (data.publishedAt
                ? new Date(data.publishedAt)
                : new Date())
            : null,

          expiresAt: data.expiresAt
            ? new Date(data.expiresAt)
            : null,
        },
      });

    /* =====================================================
       NOTIFY ONLY WHEN DRAFT -> PUBLISHED

       This prevents duplicate notifications whenever
       an already-published announcement is edited.
       ===================================================== */

    let notificationCount = 0;

    const newlyPublished =
      !wasPreviouslyPublished &&
      announcement.published;

    if (newlyPublished) {
      const notificationResult =
        await notifyAnnouncementStudents({
          announcementId:
            announcement.id,

          title:
            announcement.title,

          content:
            announcement.content,

          category:
            announcement.category,

          target:
            announcement.target,

          targetValue:
            announcement.targetValue,
        });

      notificationCount =
        notificationResult.count;
    }

    return NextResponse.json({
      success: true,
      announcement,

      notification: {
        sent: notificationCount > 0,
        count: notificationCount,
        newlyPublished,
      },
    });
  } catch (error) {
    console.error(
      "Admin announcements PUT error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid announcement data",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update announcement",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE
   ========================================================= */

export async function DELETE(
  request: NextRequest
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Announcement ID is required",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.announcement.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(
      "Admin announcements DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete announcement",
      },
      {
        status: 500,
      }
    );
  }
}
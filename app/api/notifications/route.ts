import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}

const createSchema = z.object({
  userId: z.string().min(1),
  title: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(1000),
  type: z.string().trim().max(50).optional(),
  link: z.string().trim().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load notifications.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Only administrators can create notifications.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid notification.",
        },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id: parsed.data.userId,
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Target user not found.",
        },
        { status: 404 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: parsed.data.userId,
        title: parsed.data.title,
        message: parsed.data.message,
        type: parsed.data.type || "GENERAL",
        link: parsed.data.link || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_NOTIFICATION_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create notification.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (body.action === "mark-all-read") {
      await prisma.notification.updateMany({
        where: {
          userId: currentUser.id,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read.",
      });
    }

    if (body.action === "mark-read") {
      const notificationId = String(body.notificationId || "");

      if (!notificationId) {
        return NextResponse.json(
          {
            success: false,
            message: "Notification ID is required.",
          },
          { status: 400 }
        );
      }

      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: currentUser.id,
        },
      });

      if (!notification) {
        return NextResponse.json(
          {
            success: false,
            message: "Notification not found.",
          },
          { status: 404 }
        );
      }

      await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          read: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Notification marked as read.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid notification action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("UPDATE_NOTIFICATIONS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update notifications.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID is required.",
        },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found.",
        },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (error) {
    console.error("DELETE_NOTIFICATION_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete notification.",
      },
      { status: 500 }
    );
  }
}
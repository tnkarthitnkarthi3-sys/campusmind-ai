import { prisma } from "@/lib/prisma";

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string | null;
};

export async function createNotification(
  input: CreateNotificationInput
) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type ?? "GENERAL",
      link: input.link ?? null,
    },
  });
}

export async function createNotifications(
  userIds: string[],
  notification: Omit<CreateNotificationInput, "userId">
) {
  const uniqueUserIds = [
    ...new Set(
      userIds.filter(
        (userId) => typeof userId === "string" && userId.length > 0
      )
    ),
  ];

  if (uniqueUserIds.length === 0) {
    return { count: 0 };
  }

  return prisma.notification.createMany({
    data: uniqueUserIds.map((userId) => ({
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type ?? "GENERAL",
      link: notification.link ?? null,
    })),
  });
}

export async function notifyStudentsByAcademicContext(input: {
  departmentId?: string;
  courseId?: string;
  semesterId?: string;
  title: string;
  message: string;
  type?: string;
  link?: string | null;
}) {
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",

      ...(input.departmentId
        ? { departmentId: input.departmentId }
        : {}),

      ...(input.courseId
        ? { courseId: input.courseId }
        : {}),

      ...(input.semesterId
        ? { semesterId: input.semesterId }
        : {}),
    },
    select: {
      id: true,
    },
  });

  return createNotifications(
    students.map((student) => student.id),
    {
      title: input.title,
      message: input.message,
      type: input.type ?? "ACADEMIC",
      link: input.link ?? null,
    }
  );
}

export async function notifyFacultyByDepartment(
  departmentId: string,
  notification: Omit<CreateNotificationInput, "userId">
) {
  const faculty = await prisma.user.findMany({
    where: {
      role: "FACULTY",
      departmentId,
    },
    select: {
      id: true,
    },
  });

  return createNotifications(
    faculty.map((user) => user.id),
    notification
  );
}
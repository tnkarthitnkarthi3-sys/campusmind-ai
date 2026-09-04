import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createNotifications } from "@/lib/notifications";

async function requireAdmin() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

const timetableSchema = z.object({
  day: z.string().min(1).max(20),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  room: z.string().max(100).optional().nullable(),
  section: z.string().max(50).optional().nullable(),
  departmentId: z.string().min(1),
  courseId: z.string().min(1),
  semesterId: z.string().min(1),
  subjectId: z.string().min(1),
  facultyId: z.string().min(1),
  active: z.boolean().default(true),
});

function timeToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  return (
    timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(endA) > timeToMinutes(startB)
  );
}

async function getTimetableStudentIds(input: {
  departmentId: string;
  courseId: string;
  semesterId: string;
}) {
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      departmentId: input.departmentId,
      courseId: input.courseId,
      semesterId: input.semesterId,
    },
    select: {
      id: true,
    },
  });

  return students.map((student) => student.id);
}

async function notifyTimetableStudents(input: {
  day: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  section?: string | null;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
}) {
  try {
    const studentIds = await getTimetableStudentIds({
      departmentId: input.departmentId,
      courseId: input.courseId,
      semesterId: input.semesterId,
    });

    if (studentIds.length === 0) {
      return {
        success: true,
        count: 0,
      };
    }

    const roomText = input.room?.trim()
      ? `Room: ${input.room.trim()}`
      : "Room: Not specified";

    const sectionText = input.section?.trim()
      ? `Section: ${input.section.trim()}`
      : "";

    const messageParts = [
      `Class: ${input.subjectName} (${input.subjectCode})`,
      `Day: ${input.day}`,
      `Time: ${input.startTime} - ${input.endTime}`,
      roomText,
      `Faculty: ${input.facultyName}`,
    ];

    if (sectionText) {
      messageParts.push(sectionText);
    }

    const result = await createNotifications(studentIds, {
      title: `Timetable Updated: ${input.subjectName}`,
      message: messageParts.join(" • "),
      type: "TIMETABLE",
      link: "/student-timetable",
    });

    console.log(
      `Timetable notification sent to ${result.count} students.`
    );

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error("TIMETABLE_NOTIFICATION_ERROR", error);

    return {
      success: false,
      count: 0,
    };
  }
}

async function getTimetableNotificationData(input: {
  subjectId: string;
  facultyId: string;
}) {
  const [subject, faculty] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: input.subjectId },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),

    prisma.user.findUnique({
      where: { id: input.facultyId },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return {
    subject,
    faculty,
  };
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const [entries, departments, courses, semesters, subjects, faculty] =
      await Promise.all([
        prisma.campusTimetable.findMany({
          orderBy: [
            { day: "asc" },
            { startTime: "asc" },
          ],
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
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
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            faculty: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),

        prisma.department.findMany({
          where: { active: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            code: true,
          },
        }),

        prisma.course.findMany({
          where: { active: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            code: true,
            departmentId: true,
          },
        }),

        prisma.semester.findMany({
          where: { active: true },
          orderBy: [
            { courseId: "asc" },
            { number: "asc" },
          ],
          select: {
            id: true,
            name: true,
            number: true,
            courseId: true,
          },
        }),

        prisma.subject.findMany({
          where: { active: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            code: true,
            courseId: true,
            semesterId: true,
          },
        }),

        prisma.user.findMany({
          where: {
            role: "FACULTY",
            departmentId: { not: null },
          },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            email: true,
            departmentId: true,
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      entries,
      departments,
      courses,
      semesters,
      subjects,
      faculty,
    });
  } catch (error) {
    console.error("TIMETABLE_GET_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load timetable",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = timetableSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid timetable data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
      return NextResponse.json(
        {
          success: false,
          message: "End time must be later than start time",
        },
        { status: 400 }
      );
    }

    const [course, semester, subject, faculty] = await Promise.all([
      prisma.course.findUnique({
        where: { id: data.courseId },
        select: {
          id: true,
          departmentId: true,
        },
      }),

      prisma.semester.findUnique({
        where: { id: data.semesterId },
        select: {
          id: true,
          courseId: true,
        },
      }),

      prisma.subject.findUnique({
        where: { id: data.subjectId },
        select: {
          id: true,
          courseId: true,
          semesterId: true,
        },
      }),

      prisma.user.findUnique({
        where: { id: data.facultyId },
        select: {
          id: true,
          role: true,
          departmentId: true,
        },
      }),
    ]);

    if (!course || course.departmentId !== data.departmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course does not belong to department",
        },
        { status: 400 }
      );
    }

    if (!semester || semester.courseId !== data.courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Semester does not belong to course",
        },
        { status: 400 }
      );
    }

    if (
      !subject ||
      subject.courseId !== data.courseId ||
      subject.semesterId !== data.semesterId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Subject does not match course/semester",
        },
        { status: 400 }
      );
    }

    if (!faculty || faculty.role !== "FACULTY") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid faculty",
        },
        { status: 400 }
      );
    }

    if (
      faculty.departmentId &&
      faculty.departmentId !== data.departmentId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty belongs to another department",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.campusTimetable.findMany({
      where: {
        day: data.day,
        active: true,
        OR: [
          {
            courseId: data.courseId,
            semesterId: data.semesterId,
            ...(data.section
              ? { section: data.section }
              : {}),
          },
          {
            facultyId: data.facultyId,
          },
        ],
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        courseId: true,
        semesterId: true,
        facultyId: true,
      },
    });

    const conflict = existing.find((item) =>
      overlaps(
        data.startTime,
        data.endTime,
        item.startTime,
        item.endTime
      )
    );

    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Timetable conflict detected. The class or faculty already has a session during this time.",
        },
        { status: 409 }
      );
    }

    const entry = await prisma.campusTimetable.create({
      data,
      include: {
        department: true,
        course: true,
        semester: true,
        subject: true,
        faculty: true,
      },
    });

    let notification = {
      sent: false,
      count: 0,
    };

    if (data.active) {
      const result = await notifyTimetableStudents({
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        section: data.section,
        departmentId: data.departmentId,
        courseId: data.courseId,
        semesterId: data.semesterId,
        subjectName: entry.subject.name,
        subjectCode: entry.subject.code,
        facultyName: entry.faculty.name,
      });

      notification = {
        sent: result.success && result.count > 0,
        count: result.count,
      };
    }

    return NextResponse.json({
      success: true,
      entry,
      notification,
    });
  } catch (error) {
    console.error("TIMETABLE_POST_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create timetable entry",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id
        : "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Timetable ID is required",
        },
        { status: 400 }
      );
    }

    const parsed = timetableSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid timetable data",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
      return NextResponse.json(
        {
          success: false,
          message: "End time must be later than start time",
        },
        { status: 400 }
      );
    }

    const existingEntry = await prisma.campusTimetable.findUnique({
      where: { id },
      select: {
        id: true,
        active: true,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        {
          success: false,
          message: "Timetable entry not found",
        },
        { status: 404 }
      );
    }

    const updated = await prisma.campusTimetable.update({
      where: { id },
      data,
      include: {
        department: true,
        course: true,
        semester: true,
        subject: true,
        faculty: true,
      },
    });

    let notification = {
      sent: false,
      count: 0,
    };

    // Notify only when an inactive timetable entry becomes active.
    // Normal edits do not create duplicate notifications.
    if (!existingEntry.active && data.active) {
      const result = await notifyTimetableStudents({
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        section: data.section,
        departmentId: data.departmentId,
        courseId: data.courseId,
        semesterId: data.semesterId,
        subjectName: updated.subject.name,
        subjectCode: updated.subject.code,
        facultyName: updated.faculty.name,
      });

      notification = {
        sent: result.success && result.count > 0,
        count: result.count,
      };
    }

    return NextResponse.json({
      success: true,
      entry: updated,
      notification,
    });
  } catch (error) {
    console.error("TIMETABLE_PUT_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update timetable",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Timetable ID is required",
        },
        { status: 400 }
      );
    }

    await prisma.campusTimetable.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("TIMETABLE_DELETE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete timetable entry",
      },
      { status: 500 }
    );
  }
}
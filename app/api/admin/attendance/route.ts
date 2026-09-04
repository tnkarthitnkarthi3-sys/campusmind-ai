import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

async function requireAdmin() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

const attendanceSchema = z.object({
  studentId: z.string().min(1),
  departmentId: z.string().min(1),
  courseId: z.string().min(1),
  semesterId: z.string().min(1),
  subjectId: z.string().min(1),
  attendanceDate: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  remarks: z.string().max(500).optional().nullable(),
});

function normalizeDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid attendance date");
  }

  return date;
}

function formatAttendanceDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PRESENT":
      return "Present";
    case "ABSENT":
      return "Absent";
    case "LATE":
      return "Late";
    case "EXCUSED":
      return "Excused";
    default:
      return status;
  }
}

async function sendAttendanceNotification(input: {
  studentId: string;
  subjectName: string;
  subjectCode: string;
  attendanceDate: Date;
  status: string;
  remarks?: string | null;
  updated?: boolean;
}) {
  try {
    const statusLabel = getStatusLabel(input.status);

    const actionText = input.updated
      ? "Attendance record updated."
      : "Attendance recorded.";

    const messageParts = [
      actionText,
      `Subject: ${input.subjectName} (${input.subjectCode})`,
      `Date: ${formatAttendanceDate(input.attendanceDate)}`,
      `Status: ${statusLabel}`,
    ];

    if (input.remarks?.trim()) {
      messageParts.push(`Remarks: ${input.remarks.trim()}`);
    }

    const notification = await createNotification({
      userId: input.studentId,
      title: `Attendance: ${statusLabel}`,
      message: messageParts.join(" • "),
      type: "ATTENDANCE",
      link: "/attendance",
    });

    console.log(
      `Attendance notification created for student ${input.studentId}: ${notification.id}`
    );

    return {
      success: true,
      sent: true,
    };
  } catch (error) {
    console.error("ATTENDANCE_NOTIFICATION_ERROR", error);

    return {
      success: false,
      sent: false,
    };
  }
}

async function validateHierarchy(
  departmentId: string,
  courseId: string,
  semesterId: string,
  subjectId: string,
  studentId: string
) {
  const [department, course, semester, subject, student] =
    await Promise.all([
      prisma.department.findUnique({
        where: { id: departmentId },
        select: { id: true, active: true },
      }),

      prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          departmentId: true,
          active: true,
        },
      }),

      prisma.semester.findUnique({
        where: { id: semesterId },
        select: {
          id: true,
          courseId: true,
          active: true,
        },
      }),

      prisma.subject.findUnique({
        where: { id: subjectId },
        select: {
          id: true,
          courseId: true,
          semesterId: true,
          active: true,
        },
      }),

      prisma.user.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          role: true,
          departmentId: true,
          courseId: true,
          semesterId: true,
        },
      }),
    ]);

  if (!department || !department.active) {
    return "Department not found or inactive.";
  }

  if (!course || !course.active) {
    return "Course not found or inactive.";
  }

  if (course.departmentId !== departmentId) {
    return "Selected course does not belong to the selected department.";
  }

  if (!semester || !semester.active) {
    return "Semester not found or inactive.";
  }

  if (semester.courseId !== courseId) {
    return "Selected semester does not belong to the selected course.";
  }

  if (!subject || !subject.active) {
    return "Subject not found or inactive.";
  }

  if (
    subject.courseId !== courseId ||
    subject.semesterId !== semesterId
  ) {
    return "Selected subject does not belong to the selected course and semester.";
  }

  if (!student || student.role !== "STUDENT") {
    return "Selected user is not a student.";
  }

  if (
    student.departmentId &&
    student.departmentId !== departmentId
  ) {
    return "Student does not belong to the selected department.";
  }

  if (
    student.courseId &&
    student.courseId !== courseId
  ) {
    return "Student does not belong to the selected course.";
  }

  if (
    student.semesterId &&
    student.semesterId !== semesterId
  ) {
    return "Student does not belong to the selected semester.";
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const departmentId = searchParams.get("departmentId");
    const courseId = searchParams.get("courseId");
    const semesterId = searchParams.get("semesterId");
    const subjectId = searchParams.get("subjectId");
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (departmentId) where.departmentId = departmentId;
    if (courseId) where.courseId = courseId;
    if (semesterId) where.semesterId = semesterId;
    if (subjectId) where.subjectId = subjectId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    if (date) {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59.999`);

      where.attendanceDate = {
        gte: start,
        lte: end,
      };
    }

    const rows = await prisma.campusAcademicAttendance.findMany({
      where,
      orderBy: [
        { attendanceDate: "desc" },
        { createdAt: "desc" },
      ],
      take: 500,
    });

    const [
      departments,
      courses,
      semesters,
      subjects,
      students,
    ] = await Promise.all([
      prisma.department.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      }),

      prisma.course.findMany({
        where: { active: true },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),

      prisma.semester.findMany({
        where: { active: true },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: [
          { courseId: "asc" },
          { number: "asc" },
        ],
      }),

      prisma.subject.findMany({
        where: { active: true },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              departmentId: true,
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
        orderBy: { name: "asc" },
      }),

      prisma.user.findMany({
        where: {
          role: "STUDENT",
          ...(departmentId ? { departmentId } : {}),
          ...(courseId ? { courseId } : {}),
          ...(semesterId ? { semesterId } : {}),
          ...(search
            ? {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    email: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          departmentId: true,
          courseId: true,
          semesterId: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const studentIds = [
      ...new Set(rows.map((row) => row.studentId)),
    ];

    const studentRecords =
      studentIds.length > 0
        ? await prisma.user.findMany({
            where: {
              id: {
                in: studentIds,
              },
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
          })
        : [];

    const studentMap = new Map(
      studentRecords.map((student) => [
        student.id,
        student,
      ])
    );

    const subjectMap = new Map(
      subjects.map((subject) => [
        subject.id,
        subject,
      ])
    );

    const courseMap = new Map(
      courses.map((course) => [
        course.id,
        course,
      ])
    );

    const departmentMap = new Map(
      departments.map((department) => [
        department.id,
        department,
      ])
    );

    const semesterMap = new Map(
      semesters.map((semester) => [
        semester.id,
        semester,
      ])
    );

    const attendance = rows.map((row) => ({
      ...row,
      student: studentMap.get(row.studentId) ?? null,
      subject: subjectMap.get(row.subjectId) ?? null,
      course: courseMap.get(row.courseId) ?? null,
      department: departmentMap.get(row.departmentId) ?? null,
      semester: semesterMap.get(row.semesterId) ?? null,
    }));

    const total = rows.length;

    const present = rows.filter(
      (row) => row.status === "PRESENT"
    ).length;

    const absent = rows.filter(
      (row) => row.status === "ABSENT"
    ).length;

    const late = rows.filter(
      (row) => row.status === "LATE"
    ).length;

    const excused = rows.filter(
      (row) => row.status === "EXCUSED"
    ).length;

    const percentage =
      total > 0
        ? Math.round(((present + late) / total) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      attendance,
      students,
      departments,
      courses,
      semesters,
      subjects,
      stats: {
        total,
        present,
        absent,
        late,
        excused,
        percentage,
      },
    });
  } catch (error) {
    console.error("ADMIN ATTENDANCE GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load attendance.",
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = attendanceSchema.parse(body);

    const hierarchyError = await validateHierarchy(
      data.departmentId,
      data.courseId,
      data.semesterId,
      data.subjectId,
      data.studentId
    );

    if (hierarchyError) {
      return NextResponse.json(
        {
          success: false,
          message: hierarchyError,
        },
        { status: 400 }
      );
    }

    const attendanceDate = normalizeDate(
      data.attendanceDate
    );

    const existing =
      await prisma.campusAcademicAttendance.findUnique({
        where: {
          studentId_subjectId_attendanceDate: {
            studentId: data.studentId,
            subjectId: data.subjectId,
            attendanceDate,
          },
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attendance already exists for this student, subject and date.",
        },
        { status: 409 }
      );
    }

    const attendance =
      await prisma.campusAcademicAttendance.create({
        data: {
          studentId: data.studentId,
          departmentId: data.departmentId,
          courseId: data.courseId,
          semesterId: data.semesterId,
          subjectId: data.subjectId,
          attendanceDate,
          status: data.status,
          remarks: data.remarks || null,
        },
      });

    let notification = {
      sent: false,
    };

    const subject = await prisma.subject.findUnique({
      where: {
        id: data.subjectId,
      },
      select: {
        name: true,
        code: true,
      },
    });

    if (subject) {
      const result = await sendAttendanceNotification({
        studentId: data.studentId,
        subjectName: subject.name,
        subjectCode: subject.code,
        attendanceDate,
        status: data.status,
        remarks: data.remarks,
        updated: false,
      });

      notification = {
        sent: result.sent,
      };
    }

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully.",
      attendance,
      notification,
    });
  } catch (error) {
    console.error("ADMIN ATTENDANCE POST ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.issues[0]?.message ?? "Invalid data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to record attendance.",
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const idSchema = z.object({
      id: z.string().min(1),
      status: z.enum([
        "PRESENT",
        "ABSENT",
        "LATE",
        "EXCUSED",
      ]),
      remarks: z.string().max(500).optional().nullable(),
    });

    const data = idSchema.parse(body);

    const existing =
      await prisma.campusAcademicAttendance.findUnique({
        where: { id: data.id },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record not found.",
        },
        { status: 404 }
      );
    }

    const attendance =
      await prisma.campusAcademicAttendance.update({
        where: { id: data.id },
        data: {
          status: data.status,
          remarks: data.remarks || null,
        },
      });

    let notification = {
      sent: false,
    };

    const subject = await prisma.subject.findUnique({
      where: {
        id: existing.subjectId,
      },
      select: {
        name: true,
        code: true,
      },
    });

    if (subject) {
      const result = await sendAttendanceNotification({
        studentId: existing.studentId,
        subjectName: subject.name,
        subjectCode: subject.code,
        attendanceDate: existing.attendanceDate,
        status: data.status,
        remarks: data.remarks,
        updated: true,
      });

      notification = {
        sent: result.sent,
      };
    }

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully.",
      attendance,
      notification,
    });
  } catch (error) {
    console.error("ADMIN ATTENDANCE PUT ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.issues[0]?.message ?? "Invalid data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update attendance.",
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance ID is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.campusAcademicAttendance.findUnique({
        where: { id },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record not found.",
        },
        { status: 404 }
      );
    }

    await prisma.campusAcademicAttendance.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN ATTENDANCE DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete attendance.",
      },
      { status: 500 }
    );
  }
}
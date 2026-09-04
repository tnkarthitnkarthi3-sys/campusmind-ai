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

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

const testSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  departmentId: z.string().min(1),
  courseId: z.string().min(1),
  semesterId: z.string().min(1),
  subjectId: z.string().min(1),
  duration: z.number().int().min(1).max(600),
  totalMarks: z.number().int().min(1).max(5000),
  passingMarks: z.number().int().min(0).max(5000),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  active: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
  showResult: z.boolean().default(true),
});

function parseDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date;
}

async function validateAcademicStructure(data: {
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
}) {
  const [department, course, semester, subject] = await Promise.all([
    prisma.department.findUnique({
      where: { id: data.departmentId },
      select: { id: true, active: true },
    }),

    prisma.course.findUnique({
      where: { id: data.courseId },
      select: {
        id: true,
        departmentId: true,
        active: true,
      },
    }),

    prisma.semester.findUnique({
      where: { id: data.semesterId },
      select: {
        id: true,
        courseId: true,
        active: true,
      },
    }),

    prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: {
        id: true,
        courseId: true,
        semesterId: true,
        active: true,
      },
    }),
  ]);

  if (!department || !department.active) {
    return "Selected department is invalid or inactive.";
  }

  if (!course || !course.active) {
    return "Selected course is invalid or inactive.";
  }

  if (course.departmentId !== data.departmentId) {
    return "Selected course does not belong to the selected department.";
  }

  if (!semester || !semester.active) {
    return "Selected semester is invalid or inactive.";
  }

  if (semester.courseId !== data.courseId) {
    return "Selected semester does not belong to the selected course.";
  }

  if (!subject || !subject.active) {
    return "Selected subject is invalid or inactive.";
  }

  if (
    subject.courseId !== data.courseId ||
    subject.semesterId !== data.semesterId
  ) {
    return "Selected subject does not belong to the selected course and semester.";
  }

  return null;
}

function validateDates(
  startDate?: string | null,
  endDate?: string | null
) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start && end && end <= start) {
    return "End date must be after start date.";
  }

  return null;
}

async function getTestStudentIds(input: {
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

async function notifyTestStudents(input: {
  title: string;
  description?: string | null;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startDate?: Date | null;
  endDate?: Date | null;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectName: string;
  subjectCode: string;
}) {
  try {
    const studentIds = await getTestStudentIds({
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

    const startText = input.startDate
      ? input.startDate.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not specified";

    const endText = input.endDate
      ? input.endDate.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not specified";

    const messageParts = [
      `Subject: ${input.subjectName} (${input.subjectCode})`,
      `Duration: ${input.duration} minutes`,
      `Total Marks: ${input.totalMarks}`,
      `Passing Marks: ${input.passingMarks}`,
      `Starts: ${startText}`,
      `Ends: ${endText}`,
    ];

    if (input.description?.trim()) {
      messageParts.push(`Details: ${input.description.trim()}`);
    }

    const result = await createNotifications(studentIds, {
      title: `Online Test Available: ${input.title}`,
      message: messageParts.join(" • "),
      type: "ONLINE_TEST",
      link: "/online-tests",
    });

    console.log(
      `Online test notification sent to ${result.count} students.`
    );

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error("ONLINE_TEST_NOTIFICATION_ERROR:", error);

    return {
      success: false,
      count: 0,
    };
  }
}

async function enrichTests(tests: any[]) {
  if (!tests.length) return [];

  const departmentIds = [...new Set(tests.map((x) => x.departmentId))];
  const courseIds = [...new Set(tests.map((x) => x.courseId))];
  const semesterIds = [...new Set(tests.map((x) => x.semesterId))];
  const subjectIds = [...new Set(tests.map((x) => x.subjectId))];

  const [departments, courses, semesters, subjects, questions] =
    await Promise.all([
      prisma.department.findMany({
        where: { id: { in: departmentIds } },
        select: { id: true, name: true, code: true },
      }),

      prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, name: true, code: true },
      }),

      prisma.semester.findMany({
        where: { id: { in: semesterIds } },
        select: { id: true, name: true, number: true },
      }),

      prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, name: true, code: true },
      }),

      prisma.campusTestQuestion.findMany({
        where: {
          testId: {
            in: tests.map((x) => x.id),
          },
        },
        select: {
          id: true,
          testId: true,
          question: true,
          marks: true,
          active: true,
        },
      }),
    ]);

  return tests.map((test) => ({
    ...test,
    department:
      departments.find((x) => x.id === test.departmentId) ?? null,
    course:
      courses.find((x) => x.id === test.courseId) ?? null,
    semester:
      semesters.find((x) => x.id === test.semesterId) ?? null,
    subject:
      subjects.find((x) => x.id === test.subjectId) ?? null,
    questionCount: questions.filter(
      (x) => x.testId === test.id
    ).length,
  }));
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [
      rawTests,
      departments,
      courses,
      semesters,
      subjects,
    ] = await Promise.all([
      prisma.campusOnlineTest.findMany({
        orderBy: [
          { active: "desc" },
          { createdAt: "desc" },
        ],
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
    ]);

    const tests = await enrichTests(rawTests);

    return NextResponse.json({
      tests,
      departments,
      courses,
      semesters,
      subjects,
    });
  } catch (error) {
    console.error("ONLINE TEST GET ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load online tests." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = testSchema.parse(body);

    if (data.passingMarks > data.totalMarks) {
      return NextResponse.json(
        {
          error:
            "Passing marks cannot be greater than total marks.",
        },
        { status: 400 }
      );
    }

    const structureError = await validateAcademicStructure(data);

    if (structureError) {
      return NextResponse.json(
        { error: structureError },
        { status: 400 }
      );
    }

    const dateError = validateDates(
      data.startDate,
      data.endDate
    );

    if (dateError) {
      return NextResponse.json(
        { error: dateError },
        { status: 400 }
      );
    }

    const test = await prisma.campusOnlineTest.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        departmentId: data.departmentId,
        courseId: data.courseId,
        semesterId: data.semesterId,
        subjectId: data.subjectId,
        duration: data.duration,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        startDate: parseDate(data.startDate),
        endDate: parseDate(data.endDate),
        active: data.active,
      },
    });

    let notification = {
      sent: false,
      count: 0,
    };

    if (data.active) {
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
        const result = await notifyTestStudents({
          title: data.title.trim(),
          description: data.description,
          duration: data.duration,
          totalMarks: data.totalMarks,
          passingMarks: data.passingMarks,
          startDate: parseDate(data.startDate),
          endDate: parseDate(data.endDate),
          departmentId: data.departmentId,
          courseId: data.courseId,
          semesterId: data.semesterId,
          subjectName: subject.name,
          subjectCode: subject.code,
        });

        notification = {
          sent: result.success && result.count > 0,
          count: result.count,
        };
      }
    }

    return NextResponse.json(
      {
        success: true,
        test,
        notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ONLINE TEST POST ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message || "Invalid data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create online test." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = String(body.id || "");

    if (!id) {
      return NextResponse.json(
        { error: "Test ID is required." },
        { status: 400 }
      );
    }

    const data = testSchema.parse(body);

    const existing = await prisma.campusOnlineTest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Online test not found." },
        { status: 404 }
      );
    }

    if (data.passingMarks > data.totalMarks) {
      return NextResponse.json(
        {
          error:
            "Passing marks cannot be greater than total marks.",
        },
        { status: 400 }
      );
    }

    const structureError = await validateAcademicStructure(data);

    if (structureError) {
      return NextResponse.json(
        { error: structureError },
        { status: 400 }
      );
    }

    const dateError = validateDates(
      data.startDate,
      data.endDate
    );

    if (dateError) {
      return NextResponse.json(
        { error: dateError },
        { status: 400 }
      );
    }

    const test = await prisma.campusOnlineTest.update({
      where: { id },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        departmentId: data.departmentId,
        courseId: data.courseId,
        semesterId: data.semesterId,
        subjectId: data.subjectId,
        duration: data.duration,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        startDate: parseDate(data.startDate),
        endDate: parseDate(data.endDate),
        active: data.active,
      },
    });

    let notification = {
      sent: false,
      count: 0,
    };

    // Notify only when the test changes from inactive -> active.
    // Normal edits do not send duplicate notifications.
    if (!existing.active && data.active) {
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
        const result = await notifyTestStudents({
          title: data.title.trim(),
          description: data.description,
          duration: data.duration,
          totalMarks: data.totalMarks,
          passingMarks: data.passingMarks,
          startDate: parseDate(data.startDate),
          endDate: parseDate(data.endDate),
          departmentId: data.departmentId,
          courseId: data.courseId,
          semesterId: data.semesterId,
          subjectName: subject.name,
          subjectCode: subject.code,
        });

        notification = {
          sent: result.success && result.count > 0,
          count: result.count,
        };
      }
    }

    return NextResponse.json({
      success: true,
      test,
      notification,
    });
  } catch (error) {
    console.error("ONLINE TEST PUT ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message || "Invalid data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update online test." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Test ID is required." },
        { status: 400 }
      );
    }

    const test = await prisma.campusOnlineTest.findUnique({
      where: { id },
    });

    if (!test) {
      return NextResponse.json(
        { error: "Online test not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.campusTestAnswer.deleteMany({
        where: {
          attempt: {
            testId: id,
          },
        },
      }),

      prisma.campusTestAttempt.deleteMany({
        where: { testId: id },
      }),

      prisma.campusTestOption.deleteMany({
        where: {
          question: {
            testId: id,
          },
        },
      }),

      prisma.campusTestQuestion.deleteMany({
        where: { testId: id },
      }),

      prisma.campusOnlineTest.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("ONLINE TEST DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete online test." },
      { status: 500 }
    );
  }
}
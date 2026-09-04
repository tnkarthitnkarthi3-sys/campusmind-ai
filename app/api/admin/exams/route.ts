import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createNotifications } from "@/lib/notifications";

async function requireAdmin() {
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

const examSchema = z.object({
  title: z.string().trim().min(2).max(150),
  examType: z.string().trim().min(2).max(50),
  examDate: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.coerce.number().int().min(1).max(600),
  venue: z.string().trim().max(150).optional().or(z.literal("")),
  totalMarks: z.coerce.number().int().min(1).max(1000),
  passingMarks: z.coerce.number().int().min(0).max(1000),
  instructions: z.string().trim().max(2000).optional().or(z.literal("")),
  active: z.boolean().default(true),
  departmentId: z.string().min(1),
  courseId: z.string().min(1),
  semesterId: z.string().min(1),
  subjectId: z.string().min(1),
});

async function validateAcademicPath(
  departmentId: string,
  courseId: string,
  semesterId: string,
  subjectId: string
) {
  const [department, course, semester, subject] = await Promise.all([
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
  ]);

  if (!department || !department.active) {
    return "Invalid department";
  }

  if (
    !course ||
    !course.active ||
    course.departmentId !== departmentId
  ) {
    return "Course does not belong to selected department";
  }

  if (
    !semester ||
    !semester.active ||
    semester.courseId !== courseId
  ) {
    return "Semester does not belong to selected course";
  }

  if (
    !subject ||
    !subject.active ||
    subject.courseId !== courseId ||
    subject.semesterId !== semesterId
  ) {
    return "Subject does not belong to selected semester";
  }

  return null;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return aStart < bEnd && bStart < aEnd;
}

async function checkConflict(data: {
  id?: string;
  examDate: Date;
  startTime: string;
  endTime: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  venue?: string;
}) {
  const start = new Date(data.examDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const exams = await prisma.campusAcademicExam.findMany({
    where: {
      examDate: {
        gte: start,
        lt: end,
      },
      active: true,
      ...(data.id ? { id: { not: data.id } } : {}),
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      courseId: true,
      semesterId: true,
      subjectId: true,
      venue: true,
    },
  });

  for (const exam of exams) {
    if (
      overlaps(
        data.startTime,
        data.endTime,
        exam.startTime,
        exam.endTime
      )
    ) {
      if (
        exam.courseId === data.courseId &&
        exam.semesterId === data.semesterId
      ) {
        return "Exam time conflicts with another exam for the same semester";
      }

      if (
        data.venue &&
        exam.venue &&
        data.venue.trim().toLowerCase() ===
          exam.venue.trim().toLowerCase()
      ) {
        return "Exam venue is already occupied during this time";
      }

      if (exam.subjectId === data.subjectId) {
        return "An exam already exists for this subject at this time";
      }
    }
  }

  return null;
}

async function enrichExams(exams: any[]) {
  if (!exams.length) return [];

  const departmentIds = [...new Set(exams.map((x) => x.departmentId))];
  const courseIds = [...new Set(exams.map((x) => x.courseId))];
  const semesterIds = [...new Set(exams.map((x) => x.semesterId))];
  const subjectIds = [...new Set(exams.map((x) => x.subjectId))];

  const [departments, courses, semesters, subjects] = await Promise.all([
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
  ]);

  const departmentMap = new Map(
    departments.map((item) => [item.id, item])
  );

  const courseMap = new Map(
    courses.map((item) => [item.id, item])
  );

  const semesterMap = new Map(
    semesters.map((item) => [item.id, item])
  );

  const subjectMap = new Map(
    subjects.map((item) => [item.id, item])
  );

  return exams.map((exam) => ({
    ...exam,
    department: departmentMap.get(exam.departmentId) ?? null,
    course: courseMap.get(exam.courseId) ?? null,
    semester: semesterMap.get(exam.semesterId) ?? null,
    subject: subjectMap.get(exam.subjectId) ?? null,
  }));
}

/*
|--------------------------------------------------------------------------
| EXAM NOTIFICATIONS
|--------------------------------------------------------------------------
*/

async function getExamStudentIds(input: {
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

async function notifyExamStudents(input: {
  title: string;
  examType: string;
  examDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  venue?: string | null;
  totalMarks: number;
  passingMarks: number;
  departmentId: string;
  courseId: string;
  semesterId: string;
}) {
  try {
    const studentIds = await getExamStudentIds({
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

    const examDateText = input.examDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

    const venueText =
      input.venue?.trim()
        ? `Venue: ${input.venue.trim()}`
        : "Venue: Not specified";

    const message = [
      `${input.examType} exam scheduled.`,
      `Date: ${examDateText}`,
      `Time: ${input.startTime} - ${input.endTime}`,
      `Duration: ${input.duration} minutes`,
      venueText,
      `Marks: ${input.totalMarks}`,
      `Pass Marks: ${input.passingMarks}`,
    ].join(" • ");

    const result = await createNotifications(
      studentIds,
      {
        title: `Exam Scheduled: ${input.title}`,
        message,
        type: "EXAM",
        link: "/student-exams",
      }
    );

    console.log(
      `Exam notification sent to ${result.count} students.`
    );

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error(
      "Exam notification error:",
      error
    );

    return {
      success: false,
      count: 0,
    };
  }
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [exams, departments, courses, semesters, subjects] =
      await Promise.all([
        prisma.campusAcademicExam.findMany({
          orderBy: [
            { examDate: "asc" },
            { startTime: "asc" },
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

    return NextResponse.json({
      exams: await enrichExams(exams),
      departments,
      courses,
      semesters,
      subjects,
    });
  } catch (error) {
    console.error("ADMIN EXAMS GET ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load exams" },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

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
    const data = examSchema.parse(body);

    if (data.passingMarks > data.totalMarks) {
      return NextResponse.json(
        { error: "Passing marks cannot exceed total marks" },
        { status: 400 }
      );
    }

    if (
      timeToMinutes(data.endTime) <=
      timeToMinutes(data.startTime)
    ) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const academicError = await validateAcademicPath(
      data.departmentId,
      data.courseId,
      data.semesterId,
      data.subjectId
    );

    if (academicError) {
      return NextResponse.json(
        { error: academicError },
        { status: 400 }
      );
    }

    const examDate = new Date(data.examDate);

    if (Number.isNaN(examDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid exam date" },
        { status: 400 }
      );
    }

    examDate.setHours(0, 0, 0, 0);

    const conflict = await checkConflict({
      examDate,
      startTime: data.startTime,
      endTime: data.endTime,
      courseId: data.courseId,
      semesterId: data.semesterId,
      subjectId: data.subjectId,
      venue: data.venue || undefined,
    });

    if (conflict) {
      return NextResponse.json(
        { error: conflict },
        { status: 409 }
      );
    }

    const exam = await prisma.campusAcademicExam.create({
      data: {
        title: data.title,
        examType: data.examType,
        examDate,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        venue: data.venue || null,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        instructions: data.instructions || null,
        active: data.active,
        departmentId: data.departmentId,
        courseId: data.courseId,
        semesterId: data.semesterId,
        subjectId: data.subjectId,
      },
    });

    let notificationCount = 0;

    if (exam.active) {
      const notificationResult =
        await notifyExamStudents({
          title: exam.title,
          examType: exam.examType,
          examDate: exam.examDate,
          startTime: exam.startTime,
          endTime: exam.endTime,
          duration: exam.duration,
          venue: exam.venue,
          totalMarks: exam.totalMarks,
          passingMarks: exam.passingMarks,
          departmentId: exam.departmentId,
          courseId: exam.courseId,
          semesterId: exam.semesterId,
        });

      notificationCount =
        notificationResult.count;
    }

    return NextResponse.json(
      {
        success: true,
        exam,
        notification: {
          sent: notificationCount > 0,
          count: notificationCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN EXAMS POST ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid exam details" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/

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
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    const data = examSchema.parse(body);

    if (data.passingMarks > data.totalMarks) {
      return NextResponse.json(
        { error: "Passing marks cannot exceed total marks" },
        { status: 400 }
      );
    }

    if (
      timeToMinutes(data.endTime) <=
      timeToMinutes(data.startTime)
    ) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const existing =
      await prisma.campusAcademicExam.findUnique({
        where: { id },
      });

    if (!existing) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    const academicError = await validateAcademicPath(
      data.departmentId,
      data.courseId,
      data.semesterId,
      data.subjectId
    );

    if (academicError) {
      return NextResponse.json(
        { error: academicError },
        { status: 400 }
      );
    }

    const examDate = new Date(data.examDate);

    if (Number.isNaN(examDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid exam date" },
        { status: 400 }
      );
    }

    examDate.setHours(0, 0, 0, 0);

    const conflict = await checkConflict({
      id,
      examDate,
      startTime: data.startTime,
      endTime: data.endTime,
      courseId: data.courseId,
      semesterId: data.semesterId,
      subjectId: data.subjectId,
      venue: data.venue || undefined,
    });

    if (conflict) {
      return NextResponse.json(
        { error: conflict },
        { status: 409 }
      );
    }

    const exam =
      await prisma.campusAcademicExam.update({
        where: { id },
        data: {
          title: data.title,
          examType: data.examType,
          examDate,
          startTime: data.startTime,
          endTime: data.endTime,
          duration: data.duration,
          venue: data.venue || null,
          totalMarks: data.totalMarks,
          passingMarks: data.passingMarks,
          instructions: data.instructions || null,
          active: data.active,
          departmentId: data.departmentId,
          courseId: data.courseId,
          semesterId: data.semesterId,
          subjectId: data.subjectId,
        },
      });

    let notificationCount = 0;

    /*
     * Only notify when an inactive exam becomes active.
     * This prevents duplicate notifications when
     * an already-active exam is edited.
     */
    const newlyActivated =
      !existing.active &&
      exam.active;

    if (newlyActivated) {
      const notificationResult =
        await notifyExamStudents({
          title: exam.title,
          examType: exam.examType,
          examDate: exam.examDate,
          startTime: exam.startTime,
          endTime: exam.endTime,
          duration: exam.duration,
          venue: exam.venue,
          totalMarks: exam.totalMarks,
          passingMarks: exam.passingMarks,
          departmentId: exam.departmentId,
          courseId: exam.courseId,
          semesterId: exam.semesterId,
        });

      notificationCount =
        notificationResult.count;
    }

    return NextResponse.json({
      success: true,
      exam,
      notification: {
        sent: notificationCount > 0,
        count: notificationCount,
        newlyActivated,
      },
    });
  } catch (error) {
    console.error("ADMIN EXAMS PUT ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid exam details" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    await prisma.campusAcademicExam.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "ADMIN EXAMS DELETE ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
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

const assignmentSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional().nullable(),
  instructions: z.string().max(10000).optional().nullable(),

  departmentId: z.string().min(1),
  courseId: z.string().min(1),
  semesterId: z.string().min(1),
  subjectId: z.string().min(1),

  facultyId: z.string().optional().nullable(),

  assignedDate: z.string().min(1),
  dueDate: z.string().min(1),

  totalMarks: z.number().int().min(1).max(1000),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
  ]),

  status: z.enum([
    "DRAFT",
    "PUBLISHED",
    "CLOSED",
  ]),

  attachmentUrl:
    z.string().max(2000).optional().nullable(),

  active: z.boolean().default(true),
});

function parseDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  return date;
}

async function validateStructure(data: {
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  facultyId?: string | null;
}) {
  const [
    department,
    course,
    semester,
    subject,
  ] = await Promise.all([
    prisma.department.findUnique({
      where: { id: data.departmentId },
      select: {
        id: true,
        active: true,
      },
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

  if (data.facultyId) {
    const faculty = await prisma.user.findUnique({
      where: {
        id: data.facultyId,
      },
      select: {
        id: true,
        role: true,
        departmentId: true,
      },
    });

    if (!faculty || faculty.role !== "FACULTY") {
      return "Selected faculty is invalid.";
    }

    if (
      faculty.departmentId &&
      faculty.departmentId !== data.departmentId
    ) {
      return "Selected faculty does not belong to the selected department.";
    }
  }

  return null;
}

async function enrichAssignments(assignments: any[]) {
  if (!assignments.length) {
    return [];
  }

  const departmentIds = [
    ...new Set(
      assignments.map((item) => item.departmentId)
    ),
  ];

  const courseIds = [
    ...new Set(
      assignments.map((item) => item.courseId)
    ),
  ];

  const semesterIds = [
    ...new Set(
      assignments.map((item) => item.semesterId)
    ),
  ];

  const subjectIds = [
    ...new Set(
      assignments.map((item) => item.subjectId)
    ),
  ];

  const facultyIds = [
    ...new Set(
      assignments
        .map((item) => item.facultyId)
        .filter(Boolean)
    ),
  ];

  const [
    departments,
    courses,
    semesters,
    subjects,
    faculty,
  ] = await Promise.all([
    prisma.department.findMany({
      where: {
        id: {
          in: departmentIds,
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),

    prisma.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),

    prisma.semester.findMany({
      where: {
        id: {
          in: semesterIds,
        },
      },
      select: {
        id: true,
        name: true,
        number: true,
      },
    }),

    prisma.subject.findMany({
      where: {
        id: {
          in: subjectIds,
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),

    facultyIds.length
      ? prisma.user.findMany({
          where: {
            id: {
              in: facultyIds,
            },
            role: "FACULTY",
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : [],
  ]);

  return assignments.map((item) => ({
    ...item,

    department:
      departments.find(
        (x) => x.id === item.departmentId
      ) || null,

    course:
      courses.find(
        (x) => x.id === item.courseId
      ) || null,

    semester:
      semesters.find(
        (x) => x.id === item.semesterId
      ) || null,

    subject:
      subjects.find(
        (x) => x.id === item.subjectId
      ) || null,

    faculty:
      faculty.find(
        (x) => x.id === item.facultyId
      ) || null,
  }));
}

/*
|--------------------------------------------------------------------------
| ASSIGNMENT NOTIFICATIONS
|--------------------------------------------------------------------------
*/

async function getAssignmentStudentIds(input: {
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

async function notifyAssignmentStudents(input: {
  title: string;
  description?: string | null;
  dueDate: Date;
  totalMarks: number;
  priority: string;
  departmentId: string;
  courseId: string;
  semesterId: string;
}) {
  try {
    const studentIds = await getAssignmentStudentIds({
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

    const dueDateText = input.dueDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

    const messageParts = [
      input.description?.trim() || "A new assignment has been published.",
      `Due: ${dueDateText}`,
      `Marks: ${input.totalMarks}`,
      `Priority: ${input.priority}`,
    ];

    const result = await createNotifications(
      studentIds,
      {
        title: `New Assignment: ${input.title}`,
        message: messageParts.join(" • "),
        type: "ASSIGNMENT",
        link: "/student-assignments",
      }
    );

    console.log(
      `Assignment notification sent to ${result.count} students.`
    );

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error(
      "Assignment notification error:",
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
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const [
      rawAssignments,
      departments,
      courses,
      semesters,
      subjects,
      faculty,
    ] = await Promise.all([
      prisma.campusAcademicAssignment.findMany({
        orderBy: [
          {
            active: "desc",
          },
          {
            dueDate: "asc",
          },
        ],
      }),

      prisma.department.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
      }),

      prisma.course.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          code: true,
          departmentId: true,
        },
      }),

      prisma.semester.findMany({
        where: {
          active: true,
        },
        orderBy: [
          {
            courseId: "asc",
          },
          {
            number: "asc",
          },
        ],
        select: {
          id: true,
          name: true,
          number: true,
          courseId: true,
        },
      }),

      prisma.subject.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
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
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          departmentId: true,
        },
      }),
    ]);

    const assignments =
      await enrichAssignments(rawAssignments);

    return NextResponse.json({
      assignments,
      departments,
      courses,
      semesters,
      subjects,
      faculty,
    });
  } catch (error) {
    console.error(
      "ADMIN ASSIGNMENTS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load assignments.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

export async function POST(
  request: Request
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const data = assignmentSchema.parse(body);

    const assignedDate =
      parseDate(data.assignedDate);

    const dueDate =
      parseDate(data.dueDate);

    if (dueDate <= assignedDate) {
      return NextResponse.json(
        {
          error:
            "Due date must be after assigned date.",
        },
        {
          status: 400,
        }
      );
    }

    const structureError =
      await validateStructure(data);

    if (structureError) {
      return NextResponse.json(
        {
          error: structureError,
        },
        {
          status: 400,
        }
      );
    }

    const assignment =
      await prisma.campusAcademicAssignment.create({
        data: {
          title: data.title.trim(),

          description:
            data.description?.trim() || null,

          instructions:
            data.instructions?.trim() || null,

          departmentId:
            data.departmentId,

          courseId:
            data.courseId,

          semesterId:
            data.semesterId,

          subjectId:
            data.subjectId,

          facultyId:
            data.facultyId || null,

          assignedDate,

          dueDate,

          totalMarks:
            data.totalMarks,

          priority:
            data.priority,

          status:
            data.status,

          attachmentUrl:
            data.attachmentUrl?.trim() || null,

          active:
            data.active,
        },
      });

    let notificationCount = 0;

    if (
      assignment.status === "PUBLISHED" &&
      assignment.active
    ) {
      const notificationResult =
        await notifyAssignmentStudents({
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          totalMarks: assignment.totalMarks,
          priority: assignment.priority,
          departmentId: assignment.departmentId,
          courseId: assignment.courseId,
          semesterId: assignment.semesterId,
        });

      notificationCount =
        notificationResult.count;
    }

    return NextResponse.json(
      {
        success: true,
        assignment,
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
      "ADMIN ASSIGNMENTS POST ERROR:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message ||
            "Invalid assignment data.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to create assignment.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: Request
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const id = String(body.id || "");

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Assignment ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      assignmentSchema.parse(body);

    const existing =
      await prisma.campusAcademicAssignment.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Assignment not found.",
        },
        {
          status: 404,
        }
      );
    }

    const assignedDate =
      parseDate(data.assignedDate);

    const dueDate =
      parseDate(data.dueDate);

    if (dueDate <= assignedDate) {
      return NextResponse.json(
        {
          error:
            "Due date must be after assigned date.",
        },
        {
          status: 400,
        }
      );
    }

    const structureError =
      await validateStructure(data);

    if (structureError) {
      return NextResponse.json(
        {
          error: structureError,
        },
        {
          status: 400,
        }
      );
    }

    const assignment =
      await prisma.campusAcademicAssignment.update({
        where: {
          id,
        },
        data: {
          title:
            data.title.trim(),

          description:
            data.description?.trim() || null,

          instructions:
            data.instructions?.trim() || null,

          departmentId:
            data.departmentId,

          courseId:
            data.courseId,

          semesterId:
            data.semesterId,

          subjectId:
            data.subjectId,

          facultyId:
            data.facultyId || null,

          assignedDate,

          dueDate,

          totalMarks:
            data.totalMarks,

          priority:
            data.priority,

          status:
            data.status,

          attachmentUrl:
            data.attachmentUrl?.trim() || null,

          active:
            data.active,
        },
      });

    let notificationCount = 0;

    const newlyPublished =
      existing.status !== "PUBLISHED" &&
      assignment.status === "PUBLISHED" &&
      assignment.active;

    if (newlyPublished) {
      const notificationResult =
        await notifyAssignmentStudents({
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          totalMarks: assignment.totalMarks,
          priority: assignment.priority,
          departmentId: assignment.departmentId,
          courseId: assignment.courseId,
          semesterId: assignment.semesterId,
        });

      notificationCount =
        notificationResult.count;
    }

    return NextResponse.json({
      success: true,
      assignment,
      notification: {
        sent: notificationCount > 0,
        count: notificationCount,
        newlyPublished,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN ASSIGNMENTS PUT ERROR:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message ||
            "Invalid assignment data.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to update assignment.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: Request
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const {
      searchParams,
    } = new URL(request.url);

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Assignment ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.campusAcademicAssignment.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Assignment not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.campusAcademicAssignment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "ADMIN ASSIGNMENTS DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete assignment.",
      },
      {
        status: 500,
      }
    );
  }
}
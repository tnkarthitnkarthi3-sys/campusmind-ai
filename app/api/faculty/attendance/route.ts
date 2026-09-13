import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getFaculty() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      departmentId: true,
    },
  });

  if (!user || user.role !== "FACULTY") return null;

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const faculty = await getFaculty();

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: "Faculty access required." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);

    const subjectId = searchParams.get("subjectId");
    const date = searchParams.get("date");

    const where: any = {
      facultyId: faculty.id,
      active: true,
    };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (date) {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59.999`);

      where.attendanceDate = {
        gte: start,
        lte: end,
      };
    }

    const attendance = await prisma.campusAcademicAttendance.findMany({
      where,
      orderBy: [
        { attendanceDate: "desc" },
        { createdAt: "desc" },
      ],
    });

    const studentIds = [
      ...new Set(attendance.map((item) => item.studentId)),
    ];

    const students = studentIds.length
      ? await prisma.user.findMany({
          where: {
            id: { in: studentIds },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
          orderBy: {
            name: "asc",
          },
        })
      : [];

    const studentMap = new Map(
      students.map((student) => [student.id, student]),
    );

    const result = attendance.map((item) => ({
      ...item,
      student: studentMap.get(item.studentId) ?? null,
    }));

    return NextResponse.json({
      success: true,
      attendance: result,
    });
  } catch (error) {
    console.error("FACULTY ATTENDANCE GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load attendance.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const faculty = await getFaculty();

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: "Only faculty can mark attendance." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const {
      studentId,
      departmentId,
      courseId,
      semesterId,
      subjectId,
      attendanceDate,
      status,
      remarks,
    } = body;

    if (
      !studentId ||
      !departmentId ||
      !courseId ||
      !semesterId ||
      !subjectId ||
      !attendanceDate
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Student, department, course, semester, subject and date are required.",
        },
        { status: 400 },
      );
    }

    if (!["PRESENT", "ABSENT", "LATE", "EXCUSED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid attendance status." },
        { status: 400 },
      );
    }

    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: "STUDENT",
        departmentId: faculty.departmentId ?? undefined,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: "Student is not assigned to this faculty department.",
        },
        { status: 403 },
      );
    }

    const result =
      await prisma.campusAcademicAttendance.upsert({
        where: {
          studentId_subjectId_attendanceDate: {
            studentId,
            subjectId,
            attendanceDate: new Date(attendanceDate),
          },
        },
        create: {
          studentId,
          departmentId,
          courseId,
          semesterId,
          subjectId,
          facultyId: faculty.id,
          attendanceDate: new Date(attendanceDate),
          status,
          remarks: remarks || null,
          active: true,
        },
        update: {
          departmentId,
          courseId,
          semesterId,
          facultyId: faculty.id,
          status,
          remarks: remarks || null,
          active: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Attendance saved successfully.",
      attendance: result,
    });
  } catch (error) {
    console.error("FACULTY ATTENDANCE POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save attendance.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const faculty = await getFaculty();

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: "Only faculty can edit attendance." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const {
      id,
      status,
      remarks,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Attendance ID is required." },
        { status: 400 },
      );
    }

    if (!["PRESENT", "ABSENT", "LATE", "EXCUSED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid attendance status." },
        { status: 400 },
      );
    }

    const existing =
      await prisma.campusAcademicAttendance.findFirst({
        where: {
          id,
          facultyId: faculty.id,
          active: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance record not found or not assigned to you.",
        },
        { status: 404 },
      );
    }

    const updated =
      await prisma.campusAcademicAttendance.update({
        where: { id },
        data: {
          status,
          remarks: remarks || null,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully.",
      attendance: updated,
    });
  } catch (error) {
    console.error("FACULTY ATTENDANCE PATCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update attendance.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const faculty = await getFaculty();

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: "Only faculty can remove attendance." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Attendance ID is required." },
        { status: 400 },
      );
    }

    const existing =
      await prisma.campusAcademicAttendance.findFirst({
        where: {
          id,
          facultyId: faculty.id,
          active: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance record not found or not assigned to you.",
        },
        { status: 404 },
      );
    }

    await prisma.campusAcademicAttendance.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance record removed.",
    });
  } catch (error) {
    console.error("FACULTY ATTENDANCE DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove attendance.",
      },
      { status: 500 },
    );
  }
}

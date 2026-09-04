import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("campusmind_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  return user?.role === "ADMIN" ? user : null;
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
      students,
      faculty,
      departments,
      courses,
      semesters,
      subjects,
      assignments,
      notes,
      announcements,
      exams,
      onlineTests,
      timetable,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: "STUDENT" },
      }),

      prisma.user.count({
        where: { role: "FACULTY" },
      }),

      prisma.department.count(),

      prisma.course.count(),

      prisma.semester.count(),

      prisma.subject.count(),

      prisma.assignment.count(),

      prisma.note.count(),

      prisma.announcement.count(),

      prisma.campusAcademicExam.count(),

      prisma.campusOnlineTest.count(),

      prisma.campusTimetable.count(),
    ]);

    return NextResponse.json({
      people: {
        students,
        faculty,
      },
      academic: {
        departments,
        courses,
        semesters,
        subjects,
      },
      management: {
        assignments,
        notes,
        announcements,
        exams,
        onlineTests,
        timetable,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load reports" },
      { status: 500 }
    );
  }
}
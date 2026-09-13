import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const now = new Date();

    const assignments = await prisma.assignment.findMany({
      where: {
        userId: user.id,
        dueDate: {
          gte: now,
        },
        status: {
          not: "COMPLETED",
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 20,
    });

    const exams = await prisma.exam.findMany({
      where: {
        userId: user.id,
        examDate: {
          gte: now,
        },
      },
      orderBy: {
        examDate: "asc",
      },
      take: 20,
    });

    const reminders = [
      ...assignments.map((item) => ({
        id: `assignment-${item.id}`,
        type: "ASSIGNMENT",
        title: item.title,
        subject: item.subject,
        description: item.description,
        date: item.dueDate,
        priority: item.priority,
        status: item.status,
        link: "/student-assignments",
      })),

      ...exams.map((item) => ({
        id: `exam-${item.id}`,
        type: "EXAM",
        title: `${item.subject} Exam`,
        subject: item.subject,
        description: item.description,
        date: item.examDate,
        priority: "High",
        status: "UPCOMING",
        link: "/student-exams",
      })),
    ].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    return NextResponse.json({
      success: true,
      reminders,
    });
  } catch (error) {
    console.error("REMINDERS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load reminders",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESULTS = 8;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campusmind_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 },
      );
    }

    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) {
      return NextResponse.json({
        success: true,
        query: q,
        results: [],
      });
    }

    const search = q.slice(0, 80);

    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: string;
      href: string;
    }> = [];

    /*
     * ADMIN
     */
    if (currentUser.role === "ADMIN") {
      const [students, faculty, departments, courses, subjects, assignments, notes, announcements] =
        await Promise.all([
          prisma.user.findMany({
            where: {
              role: "STUDENT",
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
            take: MAX_RESULTS,
            orderBy: { name: "asc" },
          }),

          prisma.user.findMany({
            where: {
              role: "FACULTY",
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
            take: MAX_RESULTS,
            orderBy: { name: "asc" },
          }),

          prisma.department.findMany({
            where: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              name: true,
              code: true,
            },
            take: MAX_RESULTS,
            orderBy: { name: "asc" },
          }),

          prisma.course.findMany({
            where: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              name: true,
              code: true,
            },
            take: MAX_RESULTS,
            orderBy: { name: "asc" },
          }),

          prisma.subject.findMany({
            where: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              name: true,
              code: true,
            },
            take: MAX_RESULTS,
            orderBy: { name: "asc" },
          }),

          prisma.campusAcademicAssignment.findMany({
            where: {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              title: true,
              status: true,
            },
            take: MAX_RESULTS,
            orderBy: { createdAt: "desc" },
          }),

          prisma.campusAcademicNote.findMany({
            where: {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              title: true,
              status: true,
            },
            take: MAX_RESULTS,
            orderBy: { createdAt: "desc" },
          }),

          prisma.announcement.findMany({
            where: {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              title: true,
              category: true,
            },
            take: MAX_RESULTS,
            orderBy: { createdAt: "desc" },
          }),
        ]);

      for (const item of students) {
        results.push({
          id: item.id,
          title: item.name,
          subtitle: item.email,
          type: "STUDENT",
          href: `/admin/students`,
        });
      }

      for (const item of faculty) {
        results.push({
          id: item.id,
          title: item.name,
          subtitle: item.email,
          type: "FACULTY",
          href: `/admin/faculty/${item.id}`,
        });
      }

      for (const item of departments) {
        results.push({
          id: item.id,
          title: item.name,
          subtitle: item.code,
          type: "DEPARTMENT",
          href: `/admin/departments`,
        });
      }

      for (const item of courses) {
        results.push({
          id: item.id,
          title: item.name,
          subtitle: item.code,
          type: "COURSE",
          href: `/admin/courses`,
        });
      }

      for (const item of subjects) {
        results.push({
          id: item.id,
          title: item.name,
          subtitle: item.code,
          type: "SUBJECT",
          href: `/admin/subjects`,
        });
      }

      for (const item of assignments) {
        results.push({
          id: item.id,
          title: item.title,
          subtitle: `Assignment • ${item.status}`,
          type: "ASSIGNMENT",
          href: `/admin/assignments`,
        });
      }

      for (const item of notes) {
        results.push({
          id: item.id,
          title: item.title,
          subtitle: `Academic Note • ${item.status}`,
          type: "NOTE",
          href: `/admin/notes`,
        });
      }

      for (const item of announcements) {
        results.push({
          id: item.id,
          title: item.title,
          subtitle: `Announcement • ${item.category}`,
          type: "ANNOUNCEMENT",
          href: `/admin/announcements`,
        });
      }
    }

    /*
     * FACULTY
     */
    if (currentUser.role === "FACULTY") {
      const facultyNotes = await prisma.campusAcademicNote.findMany({
        where: {
          facultyId: currentUser.id,
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          status: true,
        },
        take: MAX_RESULTS,
        orderBy: { createdAt: "desc" },
      });

      for (const item of facultyNotes) {
        results.push({
          id: item.id,
          title: item.title,
          subtitle: `My Note • ${item.status}`,
          type: "NOTE",
          href: `/faculty/notes`,
        });
      }

      const subjects = await prisma.subject.findMany({
        where: {
          faculty: {
            some: {
              facultyId: currentUser.id,
            },
          },
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
        take: MAX_RESULTS,
        orderBy: { name: "asc" },
      });

      for (const item of subjects) {
        results.push({
          id: item.id,
          title: item.name,
          subtitle: item.code,
          type: "SUBJECT",
          href: `/faculty/subjects`,
        });
      }
    }

    /*
     * STUDENT
     */
    if (currentUser.role === "STUDENT") {
      const student = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          departmentId: true,
          courseId: true,
          semesterId: true,
        },
      });

      if (student) {
        const [subjects, assignments, notes, announcements] =
          await Promise.all([
            prisma.subject.findMany({
              where: {
                courseId: student.courseId ?? undefined,
                semesterId: student.semesterId ?? undefined,
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { code: { contains: search, mode: "insensitive" } },
                ],
              },
              select: {
                id: true,
                name: true,
                code: true,
              },
              take: MAX_RESULTS,
              orderBy: { name: "asc" },
            }),

            prisma.campusAcademicAssignment.findMany({
              where: {
                departmentId: student.departmentId ?? undefined,
                courseId: student.courseId ?? undefined,
                semesterId: student.semesterId ?? undefined,
                active: true,
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                ],
              },
              select: {
                id: true,
                title: true,
                status: true,
              },
              take: MAX_RESULTS,
              orderBy: { createdAt: "desc" },
            }),

            prisma.campusAcademicNote.findMany({
              where: {
                departmentId: student.departmentId ?? undefined,
                courseId: student.courseId ?? undefined,
                semesterId: student.semesterId ?? undefined,
                status: "PUBLISHED",
                active: true,
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { content: { contains: search, mode: "insensitive" } },
                ],
              },
              select: {
                id: true,
                title: true,
                noteType: true,
              },
              take: MAX_RESULTS,
              orderBy: { createdAt: "desc" },
            }),

            prisma.announcement.findMany({
              where: {
                published: true,
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { content: { contains: search, mode: "insensitive" } },
                  {
                    targetValue: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
              select: {
                id: true,
                title: true,
                category: true,
              },
              take: MAX_RESULTS,
              orderBy: { publishedAt: "desc" },
            }),
          ]);

        for (const item of subjects) {
          results.push({
            id: item.id,
            title: item.name,
            subtitle: item.code,
            type: "SUBJECT",
            href: `/academic`,
          });
        }

        for (const item of assignments) {
          results.push({
            id: item.id,
            title: item.title,
            subtitle: `Assignment • ${item.status}`,
            type: "ASSIGNMENT",
            href: `/student-assignments`,
          });
        }

        for (const item of notes) {
          results.push({
            id: item.id,
            title: item.title,
            subtitle: `Study Note • ${item.noteType}`,
            type: "NOTE",
            href: `/notes`,
          });
        }

        for (const item of announcements) {
          results.push({
            id: item.id,
            title: item.title,
            subtitle: `Announcement • ${item.category}`,
            type: "ANNOUNCEMENT",
            href: `/student-announcements`,
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        query: search,
        results: results.slice(0, 30),
      },
      {
        headers: {
          "Cache-Control": "private, max-age=10",
        },
      },
    );
  } catch (error) {
    console.error("Global search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Search failed",
      },
      { status: 500 },
    );
  }
}
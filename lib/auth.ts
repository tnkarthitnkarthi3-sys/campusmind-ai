import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "STUDENT" | "ADMIN" | "FACULTY";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
  courseId?: string | null;
  semesterId?: string | null;
};

const SESSION_COOKIE = "campusmind_user_id";

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!userId) return null;

    const { prisma } = await import("./prisma");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        courseId: true,
        semesterId: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      departmentId: user.departmentId,
      courseId: user.courseId,
      semesterId: user.semesterId,
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<SessionUser> {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "FACULTY") redirect("/faculty");

    redirect("/dashboard");
  }

  return user;
}

export async function requireStudent(): Promise<SessionUser> {
  return requireRole(["STUDENT"]);
}

export async function requireFaculty(): Promise<SessionUser> {
  return requireRole(["FACULTY"]);
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(["ADMIN"]);
}

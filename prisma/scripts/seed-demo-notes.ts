import "dotenv/config";
import { prisma } from "../../lib/prisma";

async function main() {
  const department = await prisma.department.findFirst({
    where: {
      active: true,
      code: "CSE",
    },
  });

  if (!department) {
    throw new Error("CSE department not found. Run academic master seed first.");
  }

  const course = await prisma.course.findFirst({
    where: {
      departmentId: department.id,
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  if (!course) {
    throw new Error("CSE course not found.");
  }

  const semester = await prisma.semester.findFirst({
    where: {
      courseId: course.id,
      active: true,
    },
    orderBy: {
      number: "asc",
    },
  });

  if (!semester) {
    throw new Error("Semester not found for CSE.");
  }

  const subject = await prisma.subject.findFirst({
    where: {
      courseId: course.id,
      semesterId: semester.id,
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  if (!subject) {
    throw new Error(
      `No subject found for ${course.code} / ${semester.name}.`
    );
  }

  const existing = await prisma.campusAcademicNote.findFirst({
    where: {
      title: "Unit 1 - Introduction to Data Structures",
      departmentId: department.id,
      courseId: course.id,
      semesterId: semester.id,
      subjectId: subject.id,
    },
  });

  if (existing) {
    console.log("Demo note already exists.");
    console.log({
      id: existing.id,
      title: existing.title,
      subjectId: existing.subjectId,
    });
    return;
  }

  const note = await prisma.campusAcademicNote.create({
    data: {
      title: "Unit 1 - Introduction to Data Structures",
      content:
        "This official study material covers the fundamentals of data structures, abstract data types, classification of data structures, arrays, linked lists, stacks and queues. Students should review the definitions, operations, advantages and common applications before the next academic session.",
      noteType: "LECTURE",
      status: "PUBLISHED",
      active: true,
      departmentId: department.id,
      courseId: course.id,
      semesterId: semester.id,
      subjectId: subject.id,
      facultyId: null,
      publishedAt: new Date(),
    },
  });

  console.log("");
  console.log("============================================================");
  console.log("DEMO NOTE CREATED SUCCESSFULLY");
  console.log("============================================================");
  console.log({
    id: note.id,
    title: note.title,
    department: department.name,
    course: course.name,
    semester: semester.name,
    subject: subject.name,
    status: note.status,
  });
}

main()
  .catch((error) => {
    console.error("SEED DEMO NOTES ERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
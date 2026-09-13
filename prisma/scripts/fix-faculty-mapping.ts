import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const facultyEmail = "faculty@campusmind.ai";

  console.log("");
  console.log("==============================================");
  console.log("     CAMPUSMIND FACULTY MAPPING FIX");
  console.log("==============================================");

  const faculty = await prisma.user.findUnique({
    where: {
      email: facultyEmail,
    },
  });

  if (!faculty) {
    throw new Error(`Faculty not found: ${facultyEmail}`);
  }

  if (faculty.role !== "FACULTY") {
    throw new Error(
      `${facultyEmail} is ${faculty.role}, not FACULTY`
    );
  }

  console.log(`Faculty : ${faculty.name}`);
  console.log(`Email   : ${faculty.email}`);
  console.log(
    `Before Department ID : ${faculty.departmentId ?? "NULL"}`
  );
  console.log(
    `Before Course ID     : ${faculty.courseId ?? "NULL"}`
  );
  console.log(
    `Before Semester ID   : ${faculty.semesterId ?? "NULL"}`
  );

  const department = await prisma.department.findUnique({
    where: {
      code: "CSE",
    },
  });

  if (!department) {
    throw new Error("CSE department not found.");
  }

  const course = await prisma.course.findUnique({
    where: {
      code: "BTECH-CSE",
    },
  });

  if (!course) {
    throw new Error("BTECH-CSE course not found.");
  }

  if (course.departmentId !== department.id) {
    throw new Error(
      "BTECH-CSE does not belong to the CSE department."
    );
  }

  const semester = await prisma.semester.findUnique({
    where: {
      courseId_number: {
        courseId: course.id,
        number: 5,
      },
    },
  });

  if (!semester) {
    throw new Error(
      "Semester 5 for BTECH-CSE was not found."
    );
  }

  const updatedFaculty = await prisma.user.update({
    where: {
      id: faculty.id,
    },
    data: {
      departmentId: department.id,
      courseId: course.id,
      semesterId: semester.id,
    },
    include: {
      department: true,
      course: true,
      semester: true,
    },
  });

  console.log("");
  console.log("--------------- AFTER UPDATE ---------------");
  console.log(`Faculty    : ${updatedFaculty.name}`);
  console.log(
    `Department : ${updatedFaculty.department?.name ?? "Not assigned"}`
  );
  console.log(
    `Course     : ${updatedFaculty.course?.name ?? "Not assigned"}`
  );
  console.log(
    `Semester   : ${updatedFaculty.semester?.name ?? "Not assigned"}`
  );

  console.log("");
  console.log("==============================================");
  console.log("       FACULTY MAPPING FIXED SUCCESSFULLY");
  console.log("==============================================");
}

main()
  .catch((error) => {
    console.error("");
    console.error("FACULTY MAPPING FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
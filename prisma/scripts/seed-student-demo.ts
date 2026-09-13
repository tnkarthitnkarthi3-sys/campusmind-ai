import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("");
  console.log("==============================================");
  console.log("      CAMPUSMIND AI STUDENT DEMO SETUP");
  console.log("==============================================");

  // ---------------------------------------------------------
  // Department
  // ---------------------------------------------------------

  const department = await prisma.department.upsert({
    where: {
      code: "CSE",
    },
    update: {
      name: "Computer Science and Engineering",
      active: true,
    },
    create: {
      name: "Computer Science and Engineering",
      code: "CSE",
      description: "Department of Computer Science and Engineering",
      active: true,
    },
  });

  // ---------------------------------------------------------
  // Course
  // ---------------------------------------------------------

  const course = await prisma.course.upsert({
    where: {
      code: "BTECH-CSE",
    },
    update: {
      name: "B.Tech Computer Science and Engineering",
      departmentId: department.id,
      durationYears: 4,
      active: true,
    },
    create: {
      name: "B.Tech Computer Science and Engineering",
      code: "BTECH-CSE",
      departmentId: department.id,
      durationYears: 4,
      active: true,
    },
  });

  // ---------------------------------------------------------
  // Semester
  // ---------------------------------------------------------

  const semester = await prisma.semester.upsert({
    where: {
      courseId_number: {
        courseId: course.id,
        number: 5,
      },
    },
    update: {
      name: "Semester 5",
      active: true,
    },
    create: {
      name: "Semester 5",
      number: 5,
      courseId: course.id,
      active: true,
    },
  });

  // ---------------------------------------------------------
  // Student account
  // ---------------------------------------------------------

  const passwordHash = await bcrypt.hash(
    "CampusMind@123",
    12
  );

  const student = await prisma.user.upsert({
    where: {
      email: "dhineshdk@gmail.com",
    },
    update: {
      name: "CampusMind Student",
      passwordHash,
      role: "STUDENT",
      age: 20,
      phone: "9876543210",
      gender: "Male",
      departmentId: department.id,
      courseId: course.id,
      semesterId: semester.id,
    },
    create: {
      name: "CampusMind Student",
      email: "dhineshdk@gmail.com",
      passwordHash,
      role: "STUDENT",
      age: 20,
      phone: "9876543210",
      gender: "Male",
      departmentId: department.id,
      courseId: course.id,
      semesterId: semester.id,
    },
  });

  console.log(`Student: ${student.name}`);
  console.log(`Email: ${student.email}`);

  // ---------------------------------------------------------
  // Faculty
  // ---------------------------------------------------------

  let faculty = await prisma.user.findFirst({
    where: {
      role: "FACULTY",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!faculty) {
    const facultyPasswordHash = await bcrypt.hash(
      "Faculty@123",
      12
    );

    faculty = await prisma.user.create({
      data: {
        name: "CampusMind Faculty",
        email: "faculty@campusmind.ai",
        passwordHash: facultyPasswordHash,
        role: "FACULTY",
        departmentId: department.id,
        courseId: course.id,
        semesterId: semester.id,
      },
    });
  }

  console.log(`Faculty: ${faculty.name}`);

  // ---------------------------------------------------------
  // Subjects
  // ---------------------------------------------------------

  const definitions = [
    {
      name: "Data Structures and Algorithms",
      code: "CS501",
      credits: 4,
    },
    {
      name: "Database Management Systems",
      code: "CS502",
      credits: 4,
    },
    {
      name: "Operating Systems",
      code: "CS503",
      credits: 4,
    },
    {
      name: "Computer Networks",
      code: "CS504",
      credits: 3,
    },
    {
      name: "Artificial Intelligence",
      code: "CS505",
      credits: 3,
    },
    {
      name: "Software Engineering",
      code: "CS506",
      credits: 3,
    },
  ];

  const subjects = [];

  for (const item of definitions) {
    const subject = await prisma.subject.upsert({
      where: {
        code: item.code,
      },
      update: {
        name: item.name,
        credits: item.credits,
        courseId: course.id,
        semesterId: semester.id,
        active: true,
      },
      create: {
        name: item.name,
        code: item.code,
        credits: item.credits,
        courseId: course.id,
        semesterId: semester.id,
        active: true,
      },
    });

    subjects.push(subject);

    await prisma.subjectFaculty.upsert({
      where: {
        subjectId_facultyId: {
          subjectId: subject.id,
          facultyId: faculty.id,
        },
      },
      update: {},
      create: {
        subjectId: subject.id,
        facultyId: faculty.id,
      },
    });
  }

  // ---------------------------------------------------------
  // Clear only this student's legacy demo data
  // ---------------------------------------------------------

  await prisma.attendance.deleteMany({
    where: {
      userId: student.id,
    },
  });

  await prisma.assignment.deleteMany({
    where: {
      userId: student.id,
    },
  });

  await prisma.note.deleteMany({
    where: {
      userId: student.id,
    },
  });

  await prisma.exam.deleteMany({
    where: {
      userId: student.id,
    },
  });

  await prisma.studySession.deleteMany({
    where: {
      userId: student.id,
    },
  });

  await prisma.notification.deleteMany({
    where: {
      userId: student.id,
    },
  });

  await prisma.assignmentSubmission.deleteMany({
    where: {
      studentId: student.id,
    },
  });

  // ---------------------------------------------------------
  // Attendance
  // ---------------------------------------------------------

  const attendanceTargets = [
    {
      subject: subjects[0].name,
      present: 18,
    },
    {
      subject: subjects[1].name,
      present: 17,
    },
    {
      subject: subjects[2].name,
      present: 14,
    },
    {
      subject: subjects[3].name,
      present: 19,
    },
    {
      subject: subjects[4].name,
      present: 16,
    },
    {
      subject: subjects[5].name,
      present: 18,
    },
  ];

  for (let s = 0; s < attendanceTargets.length; s++) {
    const target = attendanceTargets[s];

    for (let i = 0; i < 20; i++) {
      const date = new Date();

      date.setDate(
        date.getDate() - ((19 - i) * 2 + s)
      );

      date.setHours(9, 0, 0, 0);

      await prisma.attendance.create({
        data: {
          userId: student.id,
          subject: target.subject,
          date,
          present: i < target.present,
        },
      });
    }
  }

  // ---------------------------------------------------------
  // Assignments
  // ---------------------------------------------------------

  const assignments = [
    {
      title: "Binary Search Tree Implementation",
      subject: subjects[0].name,
      priority: "High",
      status: "PENDING" as const,
      days: 1,
    },
    {
      title: "SQL Query Optimization",
      subject: subjects[1].name,
      priority: "Medium",
      status: "IN_PROGRESS" as const,
      days: 3,
    },
    {
      title: "CPU Scheduling Algorithms",
      subject: subjects[2].name,
      priority: "High",
      status: "PENDING" as const,
      days: 5,
    },
    {
      title: "Network Protocol Analysis",
      subject: subjects[3].name,
      priority: "Medium",
      status: "PENDING" as const,
      days: 7,
    },
    {
      title: "AI Search Algorithms",
      subject: subjects[4].name,
      priority: "High",
      status: "COMPLETED" as const,
      days: -2,
    },
  ];

  for (const item of assignments) {
    const dueDate = new Date();

    dueDate.setDate(
      dueDate.getDate() + item.days
    );

    dueDate.setHours(23, 59, 0, 0);

    await prisma.assignment.create({
      data: {
        userId: student.id,
        title: item.title,
        subject: item.subject,
        description: `CampusMind AI demo assignment for ${item.subject}.`,
        dueDate,
        priority: item.priority,
        status: item.status,
      },
    });
  }

  // ---------------------------------------------------------
  // Exams
  // ---------------------------------------------------------

  for (let i = 0; i < subjects.length; i++) {
    const examDate = new Date();

    examDate.setDate(
      examDate.getDate() + 2 + i * 3
    );

    examDate.setHours(10, 0, 0, 0);

    await prisma.exam.create({
      data: {
        userId: student.id,
        subject: subjects[i].name,
        examDate,
        description: "Internal Assessment - I",
      },
    });
  }

  // ---------------------------------------------------------
  // Notes
  // ---------------------------------------------------------

  const noteData = [
    ["BST Important Concepts", subjects[0].name],
    ["Database Normalization", subjects[1].name],
    ["Process Management", subjects[2].name],
    ["TCP/IP Model", subjects[3].name],
    ["Machine Learning Basics", subjects[4].name],
    ["SDLC Fundamentals", subjects[5].name],
  ];

  for (const [title, subject] of noteData) {
    await prisma.note.create({
      data: {
        userId: student.id,
        title,
        subject,
        content: `Important ${subject} concepts for Semester 5 examination preparation.`,
      },
    });
  }

  // ---------------------------------------------------------
  // Study sessions
  // ---------------------------------------------------------

  const studyTitles = [
    "DSA Practice",
    "DBMS Revision",
    "Operating Systems",
    "Computer Networks",
    "AI Concepts",
    "Software Engineering",
    "Mock Test",
    "Exam Preparation",
    "Coding Practice",
    "Project Development",
  ];

  for (let i = 0; i < studyTitles.length; i++) {
    const startTime = new Date();

    startTime.setDate(
      startTime.getDate() - (i % 7)
    );

    startTime.setHours(
      18,
      0,
      0,
      0
    );

    const endTime = new Date(startTime);

    endTime.setHours(
      19,
      0,
      0,
      0
    );

    await prisma.studySession.create({
      data: {
        userId: student.id,
        title: studyTitles[i],
        startTime,
        endTime,
        completed: i < 8,
      },
    });
  }

  // ---------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------

  const notifications = [
    {
      title: "Upcoming Internal Exams",
      message: "Your internal examinations are approaching.",
      type: "EXAM",
      link: "/exams",
    },
    {
      title: "Assignment Deadline",
      message: "You have a high-priority assignment due soon.",
      type: "ASSIGNMENT",
      link: "/assignments",
    },
    {
      title: "Attendance Alert",
      message: "Operating Systems attendance is below 75%.",
      type: "ATTENDANCE",
      link: "/attendance",
    },
  ];

  for (const item of notifications) {
    await prisma.notification.create({
      data: {
        userId: student.id,
        title: item.title,
        message: item.message,
        type: item.type,
        link: item.link,
        read: false,
      },
    });
  }

  console.log("");
  console.log("==============================================");
  console.log("       STUDENT DEMO DATA READY");
  console.log("==============================================");
  console.log("Login email    : dhineshdk@gmail.com");
  console.log("Login password : CampusMind@123");
  console.log("Attendance     : 120 records");
  console.log("Subjects       : 6");
  console.log("Assignments    : 5");
  console.log("Exams          : 6");
  console.log("Notes          : 6");
  console.log("Study sessions : 10");
  console.log("Notifications  : 3");
  console.log("==============================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("STUDENT DEMO SEED FAILED");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



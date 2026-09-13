import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

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
  console.log("       CAMPUSMIND AI PROFESSIONAL SEED");
  console.log("==============================================");

  // =========================================================
  // 1. DEPARTMENT
  // =========================================================

  const department = await prisma.department.upsert({
    where: {
      code: "CSE",
    },
    update: {
      name: "Computer Science and Engineering",
      description:
        "Department of Computer Science and Engineering",
      active: true,
    },
    create: {
      name: "Computer Science and Engineering",
      code: "CSE",
      description:
        "Department of Computer Science and Engineering",
      active: true,
    },
  });

  // =========================================================
  // 2. COURSE
  // =========================================================

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

  // =========================================================
  // 3. SEMESTER
  // =========================================================

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

  // =========================================================
  // 4. STUDENT
  // =========================================================

  let student = await prisma.user.findUnique({
    where: {
      email: "deepak@campusmind.ai",
    },
  });

  if (!student || student.role !== "STUDENT") {
    student = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  if (!student) {
    throw new Error(
      "No STUDENT account found. Please create a student account first."
    );
  }

  student = await prisma.user.update({
    where: {
      id: student.id,
    },
    data: {
      rollNo: student.rollNo ?? "CSE2024-001",
      age: student.age ?? 20,
      phone: student.phone ?? "9876543210",
      gender: student.gender ?? "Male",
      departmentId: department.id,
      courseId: course.id,
      semesterId: semester.id,
    },
  });

  console.log(
    `Student: ${student.name} (${student.email})`
  );

  // =========================================================
  // 5. FACULTY
  // =========================================================

  const faculty = await prisma.user.findFirst({
    where: {
      role: "FACULTY",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!faculty) {
    throw new Error(
      "No FACULTY account found. Run ensure-faculty.ts first."
    );
  }

  console.log(
    `Faculty: ${faculty.name} (${faculty.email})`
  );

  // =========================================================
  // 6. SUBJECTS
  // =========================================================

  const subjectDefinitions = [
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

  for (const definition of subjectDefinitions) {
    const subject = await prisma.subject.upsert({
      where: {
        code: definition.code,
      },
      update: {
        name: definition.name,
        credits: definition.credits,
        courseId: course.id,
        semesterId: semester.id,
        active: true,
      },
      create: {
        name: definition.name,
        code: definition.code,
        credits: definition.credits,
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

  console.log(`Subjects created/updated: ${subjects.length}`);

  // =========================================================
  // 7. CLEAN STUDENT DEMO DATA
  // =========================================================

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

  // =========================================================
  // 8. ATTENDANCE
  // =========================================================

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

  let attendanceCount = 0;

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

      attendanceCount++;
    }
  }

  // =========================================================
  // 9. OFFICIAL ACADEMIC ATTENDANCE
  // =========================================================

  await prisma.campusAcademicAttendance.deleteMany({
    where: {
      studentId: student.id,
    },
  });

  for (let s = 0; s < subjects.length; s++) {
    const target =
      attendanceTargets[s];

    for (let i = 0; i < 20; i++) {
      const date = new Date();

      date.setDate(
        date.getDate() - ((19 - i) * 2 + s)
      );

      date.setHours(9, 0, 0, 0);

      await prisma.campusAcademicAttendance.create({
        data: {
          studentId: student.id,
          departmentId: department.id,
          courseId: course.id,
          semesterId: semester.id,
          subjectId: subjects[s].id,
          facultyId: faculty.id,
          attendanceDate: date,
          status:
            i < target.present
              ? "PRESENT"
              : "ABSENT",
          active: true,
        },
      });
    }
  }

  // =========================================================
  // 10. LEGACY ASSIGNMENTS
  // =========================================================

  const assignmentDefinitions = [
    {
      title: "Binary Search Tree Implementation",
      subject: subjects[0].name,
      description:
        "Implement insertion, deletion, traversal and search operations for a binary search tree.",
      dueDate: "2026-09-12T23:59:00",
      priority: "High",
      status: "PENDING" as const,
    },
    {
      title: "SQL Query Optimization",
      subject: subjects[1].name,
      description:
        "Prepare optimized SQL queries using joins, indexes and aggregation.",
      dueDate: "2026-09-14T23:59:00",
      priority: "Medium",
      status: "IN_PROGRESS" as const,
    },
    {
      title: "CPU Scheduling Algorithms",
      subject: subjects[2].name,
      description:
        "Compare FCFS, SJF, Priority and Round Robin scheduling algorithms.",
      dueDate: "2026-09-17T23:59:00",
      priority: "High",
      status: "PENDING" as const,
    },
    {
      title: "Network Protocol Analysis",
      subject: subjects[3].name,
      description:
        "Analyze TCP/IP protocol layers and real-world networking examples.",
      dueDate: "2026-09-19T23:59:00",
      priority: "Medium",
      status: "PENDING" as const,
    },
    {
      title: "AI Search Algorithms",
      subject: subjects[4].name,
      description:
        "Implement BFS, DFS and A* search and compare their performance.",
      dueDate: "2026-09-22T23:59:00",
      priority: "High",
      status: "COMPLETED" as const,
    },
  ];

  for (const assignment of assignmentDefinitions) {
    await prisma.assignment.create({
      data: {
        userId: student.id,
        title: assignment.title,
        subject: assignment.subject,
        description: assignment.description,
        dueDate: new Date(assignment.dueDate),
        priority: assignment.priority,
        status: assignment.status,
      },
    });
  }

  // =========================================================
  // 11. OFFICIAL ACADEMIC ASSIGNMENTS
  // =========================================================

  const officialAssignments = [
    {
      title: "DSA Lab Record - Trees",
      subjectId: subjects[0].id,
      description:
        "Complete the laboratory exercises based on binary trees and binary search trees.",
      instructions:
        "Submit source code and output screenshots.",
      dueDate: "2026-09-12T23:59:00",
      totalMarks: 20,
      priority: "HIGH",
    },
    {
      title: "DBMS Normalization Assignment",
      subjectId: subjects[1].id,
      description:
        "Prepare detailed examples for 1NF, 2NF, 3NF and BCNF.",
      instructions:
        "Include functional dependencies and relational schemas.",
      dueDate: "2026-09-15T23:59:00",
      totalMarks: 20,
      priority: "MEDIUM",
    },
    {
      title: "Operating System Scheduling",
      subjectId: subjects[2].id,
      description:
        "Analyze CPU scheduling algorithms with sample calculations.",
      instructions:
        "Submit comparison table and Gantt charts.",
      dueDate: "2026-09-18T23:59:00",
      totalMarks: 25,
      priority: "HIGH",
    },
    {
      title: "Computer Networks Case Study",
      subjectId: subjects[3].id,
      description:
        "Prepare a case study on TCP/IP based network communication.",
      instructions:
        "Include protocol stack diagram and practical examples.",
      dueDate: "2026-09-20T23:59:00",
      totalMarks: 20,
      priority: "MEDIUM",
    },
    {
      title: "AI Search Strategy Report",
      subjectId: subjects[4].id,
      description:
        "Compare uninformed and informed search strategies.",
      instructions:
        "Explain BFS, DFS, UCS and A*.",
      dueDate: "2026-09-23T23:59:00",
      totalMarks: 25,
      priority: "HIGH",
    },
    {
      title: "Software Engineering Mini Project",
      subjectId: subjects[5].id,
      description:
        "Prepare software requirements and system design documentation.",
      instructions:
        "Submit SRS and UML diagrams.",
      dueDate: "2026-09-26T23:59:00",
      totalMarks: 30,
      priority: "HIGH",
    },
  ];

  const createdOfficialAssignments = [];

  for (const assignment of officialAssignments) {
    const created =
      await prisma.campusAcademicAssignment.create({
        data: {
          title: assignment.title,
          description: assignment.description,
          instructions: assignment.instructions,
          departmentId: department.id,
          courseId: course.id,
          semesterId: semester.id,
          subjectId: assignment.subjectId,
          facultyId: faculty.id,
          dueDate: new Date(assignment.dueDate),
          totalMarks: assignment.totalMarks,
          priority: assignment.priority,
          status: "PUBLISHED",
          active: true,
        },
      });

    createdOfficialAssignments.push(created);
  }

  // =========================================================
  // 12. EXAMS
  // =========================================================

  const examDefinitions = [
    {
      subject: subjects[0].name,
      examDate: "2026-09-12T10:00:00",
    },
    {
      subject: subjects[1].name,
      examDate: "2026-09-15T10:00:00",
    },
    {
      subject: subjects[2].name,
      examDate: "2026-09-18T10:00:00",
    },
    {
      subject: subjects[3].name,
      examDate: "2026-09-21T10:00:00",
    },
    {
      subject: subjects[4].name,
      examDate: "2026-09-24T10:00:00",
    },
    {
      subject: subjects[5].name,
      examDate: "2026-09-27T10:00:00",
    },
  ];

  for (const exam of examDefinitions) {
    await prisma.exam.create({
      data: {
        userId: student.id,
        subject: exam.subject,
        examDate: new Date(exam.examDate),
        description: "Internal Assessment - I",
      },
    });
  }

  // =========================================================
  // 13. OFFICIAL ACADEMIC EXAMS
  // =========================================================

  await prisma.campusAcademicExam.deleteMany({
    where: {
      courseId: course.id,
      semesterId: semester.id,
    },
  });

  const officialExams = [
    {
      title: "Internal Assessment - I",
      subjectId: subjects[0].id,
      examDate: "2026-09-12T10:00:00",
    },
    {
      title: "Internal Assessment - I",
      subjectId: subjects[1].id,
      examDate: "2026-09-15T10:00:00",
    },
    {
      title: "Internal Assessment - I",
      subjectId: subjects[2].id,
      examDate: "2026-09-18T10:00:00",
    },
    {
      title: "Internal Assessment - I",
      subjectId: subjects[3].id,
      examDate: "2026-09-21T10:00:00",
    },
    {
      title: "Internal Assessment - I",
      subjectId: subjects[4].id,
      examDate: "2026-09-24T10:00:00",
    },
    {
      title: "Internal Assessment - I",
      subjectId: subjects[5].id,
      examDate: "2026-09-27T10:00:00",
    },
  ];

  for (const exam of officialExams) {
    await prisma.campusAcademicExam.create({
      data: {
        title: exam.title,
        examType: "INTERNAL",
        subjectId: exam.subjectId,
        departmentId: department.id,
        courseId: course.id,
        semesterId: semester.id,
        examDate: new Date(exam.examDate),
        startTime: "10:00",
        endTime: "12:00",
        duration: 120,
        venue: "Main Examination Hall",
        totalMarks: 100,
        passingMarks: 40,
        instructions:
          "Students must carry their college ID card.",
        active: true,
      },
    });
  }

  // =========================================================
  // 14. NOTES
  // =========================================================

  const notes = [
    {
      title: "BST Important Concepts",
      subject: subjects[0].name,
      content:
        "Binary search tree properties, insertion, deletion, traversal and time complexity.",
    },
    {
      title: "Database Normalization",
      subject: subjects[1].name,
      content:
        "1NF, 2NF, 3NF, BCNF and functional dependency concepts with examples.",
    },
    {
      title: "Process Management",
      subject: subjects[2].name,
      content:
        "Process states, PCB, context switching and CPU scheduling.",
    },
    {
      title: "TCP/IP Model",
      subject: subjects[3].name,
      content:
        "Application, Transport, Internet and Network Access layers.",
    },
    {
      title: "Machine Learning Basics",
      subject: subjects[4].name,
      content:
        "Supervised learning, unsupervised learning and model evaluation.",
    },
    {
      title: "SDLC Fundamentals",
      subject: subjects[5].name,
      content:
        "Requirements, design, implementation, testing, deployment and maintenance.",
    },
  ];

  for (const note of notes) {
    await prisma.note.create({
      data: {
        userId: student.id,
        title: note.title,
        subject: note.subject,
        content: note.content,
      },
    });
  }

  // =========================================================
  // 15. OFFICIAL NOTES
  // =========================================================

  await prisma.campusAcademicNote.deleteMany({
    where: {
      courseId: course.id,
      semesterId: semester.id,
    },
  });

  const officialNotes = [
    {
      title: "Data Structures - Trees",
      subjectId: subjects[0].id,
      content:
        "Complete lecture notes covering trees, binary trees and binary search trees.",
    },
    {
      title: "DBMS - Normalization",
      subjectId: subjects[1].id,
      content:
        "Detailed notes on database normalization and functional dependencies.",
    },
    {
      title: "Operating Systems - Processes",
      subjectId: subjects[2].id,
      content:
        "Process management, scheduling and synchronization notes.",
    },
    {
      title: "Computer Networks - TCP/IP",
      subjectId: subjects[3].id,
      content:
        "TCP/IP architecture and network protocol fundamentals.",
    },
    {
      title: "Artificial Intelligence - Search",
      subjectId: subjects[4].id,
      content:
        "BFS, DFS, Uniform Cost Search and A* algorithm notes.",
    },
    {
      title: "Software Engineering - SDLC",
      subjectId: subjects[5].id,
      content:
        "Software development life cycle and requirement engineering notes.",
    },
  ];

  for (const note of officialNotes) {
    await prisma.campusAcademicNote.create({
      data: {
        title: note.title,
        content: note.content,
        noteType: "LECTURE",
        status: "PUBLISHED",
        active: true,
        departmentId: department.id,
        courseId: course.id,
        semesterId: semester.id,
        subjectId: note.subjectId,
        facultyId: faculty.id,
        publishedAt: new Date(),
      },
    });
  }

  // =========================================================
  // 16. STUDY SESSIONS
  // =========================================================

  const studyTitles = [
    "DSA Practice",
    "DBMS Revision",
    "Operating Systems",
    "Computer Networks",
    "AI Concepts",
    "Software Engineering",
    "Mock Test",
    "Assignment Work",
    "Exam Preparation",
    "Coding Practice",
    "Project Development",
    "Revision Session",
  ];

  for (let i = 0; i < studyTitles.length; i++) {
    const startTime = new Date();

    startTime.setDate(
      startTime.getDate() - (i + 1)
    );

    startTime.setHours(18, 0, 0, 0);

    const endTime = new Date(startTime);

    endTime.setHours(19, 0, 0, 0);

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

  // =========================================================
  // 17. NOTIFICATIONS
  // =========================================================

  const notificationDefinitions = [
    {
      title: "Upcoming Internal Exams",
      message:
        "Your internal examinations begin on 12 September 2026.",
      type: "EXAM",
      link: "/exams",
    },
    {
      title: "Assignment Deadline",
      message:
        "You have a high-priority assignment due soon.",
      type: "ASSIGNMENT",
      link: "/assignments",
    },
    {
      title: "Attendance Alert",
      message:
        "Operating Systems attendance is below the recommended level.",
      type: "ATTENDANCE",
      link: "/attendance",
    },
  ];

  for (const notification of notificationDefinitions) {
    await prisma.notification.create({
      data: {
        userId: student.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        read: false,
      },
    });
  }

  // =========================================================
  // 18. TIMETABLE
  // =========================================================

  await prisma.campusTimetable.deleteMany({
    where: {
      courseId: course.id,
      semesterId: semester.id,
    },
  });

  const timetable = [
    {
      day: "Monday",
      startTime: "09:00",
      endTime: "10:00",
      room: "CSE-301",
      subject: subjects[0],
    },
    {
      day: "Monday",
      startTime: "10:15",
      endTime: "11:15",
      room: "CSE-302",
      subject: subjects[1],
    },
    {
      day: "Tuesday",
      startTime: "09:00",
      endTime: "10:00",
      room: "CSE-303",
      subject: subjects[2],
    },
    {
      day: "Tuesday",
      startTime: "10:15",
      endTime: "11:15",
      room: "CSE-304",
      subject: subjects[3],
    },
    {
      day: "Wednesday",
      startTime: "09:00",
      endTime: "10:00",
      room: "AI-LAB",
      subject: subjects[4],
    },
    {
      day: "Wednesday",
      startTime: "10:15",
      endTime: "11:15",
      room: "CSE-305",
      subject: subjects[5],
    },
    {
      day: "Thursday",
      startTime: "09:00",
      endTime: "10:00",
      room: "CSE-301",
      subject: subjects[0],
    },
    {
      day: "Thursday",
      startTime: "10:15",
      endTime: "11:15",
      room: "CSE-302",
      subject: subjects[2],
    },
    {
      day: "Friday",
      startTime: "09:00",
      endTime: "10:00",
      room: "DB-LAB",
      subject: subjects[1],
    },
    {
      day: "Friday",
      startTime: "10:15",
      endTime: "11:15",
      room: "NETWORK-LAB",
      subject: subjects[3],
    },
  ];

  for (const item of timetable) {
    await prisma.campusTimetable.create({
      data: {
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
        room: item.room,
        section: "A",
        active: true,
        departmentId: department.id,
        courseId: course.id,
        semesterId: semester.id,
        subjectId: item.subject.id,
        facultyId: faculty.id,
      },
    });
  }

  // =========================================================
  // 19. FINAL SUMMARY
  // =========================================================

  console.log("");
  console.log("==============================================");
  console.log("       CAMPUSMIND AI SEED COMPLETED");
  console.log("==============================================");
  console.log(`Student       : ${student.name}`);
  console.log(`Email         : ${student.email}`);
  console.log(`Department    : ${department.name}`);
  console.log(`Course        : ${course.name}`);
  console.log(`Semester      : ${semester.name}`);
  console.log(`Subjects      : ${subjects.length}`);
  console.log(`Attendance    : ${attendanceCount} records`);
  console.log(`Assignments   : ${assignmentDefinitions.length}`);
  console.log(`Official Work: ${createdOfficialAssignments.length}`);
  console.log(`Exams         : ${examDefinitions.length}`);
  console.log(`Notes         : ${notes.length}`);
  console.log(`Study Sessions: ${studyTitles.length}`);
  console.log(`Notifications : ${notificationDefinitions.length}`);
  console.log(`Timetable     : ${timetable.length} classes`);
  console.log("==============================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ CAMPUSMIND SEED FAILED");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
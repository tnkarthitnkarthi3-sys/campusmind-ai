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
  const user = await prisma.user.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!user) {
    throw new Error(
      "No user found. Please register a CampusMind account first."
    );
  }

  console.log(`Seeding data for: ${user.name} (${user.email})`);

  await prisma.attendance.deleteMany({
    where: { userId: user.id },
  });

  await prisma.assignment.deleteMany({
    where: { userId: user.id },
  });

  await prisma.note.deleteMany({
    where: { userId: user.id },
  });

  await prisma.exam.deleteMany({
    where: { userId: user.id },
  });

  await prisma.studySession.deleteMany({
    where: { userId: user.id },
  });

  const subjects = [
    "Data Structures",
    "Database Management",
    "Computer Networks",
    "Operating Systems",
  ];

  const attendanceRecords = [];

  for (const subject of subjects) {
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 2 + subjects.indexOf(subject)));

      attendanceRecords.push({
        userId: user.id,
        subject,
        date,
        present: i !== 7,
      });
    }
  }

  await prisma.attendance.createMany({
    data: attendanceRecords,
  });

  const now = new Date();

  await prisma.assignment.createMany({
    data: [
      {
        userId: user.id,
        title: "Database Normalization Report",
        subject: "Database Management",
        description: "Prepare a report covering 1NF, 2NF, 3NF and BCNF.",
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        priority: "High",
        status: "PENDING",
      },
      {
        userId: user.id,
        title: "TCP/IP Protocol Analysis",
        subject: "Computer Networks",
        description: "Analyze the TCP/IP protocol stack.",
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        priority: "High",
        status: "IN_PROGRESS",
      },
      {
        userId: user.id,
        title: "Binary Search Tree Implementation",
        subject: "Data Structures",
        description: "Implement insertion, deletion and traversal operations.",
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        priority: "Medium",
        status: "PENDING",
      },
      {
        userId: user.id,
        title: "Process Scheduling",
        subject: "Operating Systems",
        description: "Compare FCFS, SJF and Round Robin scheduling.",
        dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        priority: "Medium",
        status: "PENDING",
      },
      {
        userId: user.id,
        title: "SQL Query Practice",
        subject: "Database Management",
        description: "Complete advanced SQL query exercises.",
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        priority: "Low",
        status: "COMPLETED",
      },
      {
        userId: user.id,
        title: "Network Topology Assignment",
        subject: "Computer Networks",
        description: "Create and explain common network topologies.",
        dueDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        priority: "Medium",
        status: "COMPLETED",
      },
      {
        userId: user.id,
        title: "Memory Management Notes",
        subject: "Operating Systems",
        description: "Prepare notes on paging and segmentation.",
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        priority: "Low",
        status: "COMPLETED",
      },
      {
        userId: user.id,
        title: "Graph Algorithms",
        subject: "Data Structures",
        description: "Study BFS, DFS and shortest path algorithms.",
        dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        priority: "Medium",
        status: "IN_PROGRESS",
      },
    ],
  });

  await prisma.exam.createMany({
    data: [
      {
        userId: user.id,
        subject: "Operating Systems",
        examDate: new Date("2026-09-08T10:00:00"),
        description: "Internal Assessment - I",
      },
      {
        userId: user.id,
        subject: "Database Management",
        examDate: new Date("2026-09-10T10:00:00"),
        description: "Internal Assessment - I",
      },
      {
        userId: user.id,
        subject: "Computer Networks",
        examDate: new Date("2026-09-13T10:00:00"),
        description: "Internal Assessment - I",
      },
      {
        userId: user.id,
        subject: "Data Structures",
        examDate: new Date("2026-09-15T10:00:00"),
        description: "Internal Assessment - I",
      },
      {
        userId: user.id,
        subject: "Operating Systems",
        examDate: new Date("2026-09-17T10:00:00"),
        description: "Model Examination",
      },
      {
        userId: user.id,
        subject: "Database Management",
        examDate: new Date("2026-09-20T10:00:00"),
        description: "Model Examination",
      },
    ],
  });

  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        title: "Normalization",
        subject: "Database Management",
        content:
          "Normalization reduces redundancy and improves database integrity. Important forms include 1NF, 2NF, 3NF and BCNF.",
      },
      {
        userId: user.id,
        title: "SQL Joins",
        subject: "Database Management",
        content:
          "INNER JOIN returns matching rows. LEFT JOIN returns all rows from the left table and matching rows from the right table.",
      },
      {
        userId: user.id,
        title: "TCP and UDP",
        subject: "Computer Networks",
        content:
          "TCP is connection-oriented and reliable. UDP is connectionless and focuses on speed and low overhead.",
      },
      {
        userId: user.id,
        title: "OSI Model",
        subject: "Computer Networks",
        content:
          "The OSI model contains seven layers: Physical, Data Link, Network, Transport, Session, Presentation and Application.",
      },
      {
        userId: user.id,
        title: "Process Scheduling",
        subject: "Operating Systems",
        content:
          "Common CPU scheduling algorithms include FCFS, SJF, Priority Scheduling and Round Robin.",
      },
      {
        userId: user.id,
        title: "Memory Management",
        subject: "Operating Systems",
        content:
          "Virtual memory allows processes to use more memory than physically available using paging and related techniques.",
      },
      {
        userId: user.id,
        title: "Trees",
        subject: "Data Structures",
        content:
          "Binary search trees maintain ordered data. Traversals include inorder, preorder and postorder.",
      },
      {
        userId: user.id,
        title: "Graph Algorithms",
        subject: "Data Structures",
        content:
          "BFS explores level by level while DFS explores depth first. Both are fundamental graph traversal techniques.",
      },
    ],
  });

  const sessions = [];

  for (let i = 0; i < 12; i++) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - i);
    startTime.setHours(18, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 60);

    sessions.push({
      userId: user.id,
      title: i % 2 === 0 ? "Database Study" : "DSA Practice",
      startTime,
      endTime,
      completed: i < 8,
    });
  }

  await prisma.studySession.createMany({
    data: sessions,
  });

  console.log("");
  console.log("====================================");
  console.log("CampusMind AI seed completed");
  console.log("====================================");
  console.log(`User: ${user.name}`);
  console.log(`Attendance: ${attendanceRecords.length} records`);
  console.log("Assignments: 8");
  console.log("Exams: 6");
  console.log("Notes: 8");
  console.log("Study sessions: 12");
  console.log("====================================");
}

main()
  .catch((error) => {
    console.error("SEED_ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

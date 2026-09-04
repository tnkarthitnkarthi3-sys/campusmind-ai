import "dotenv/config";
import { prisma } from "../../lib/prisma";

type DepartmentSeed = {
  name: string;
  code: string;
  description: string;
  courses: {
    name: string;
    code: string;
    durationYears: number;
    semesters: string[];
  }[];
};

const departments: DepartmentSeed[] = [
  {
    name: "Computer Science and Engineering",
    code: "CSE",
    description:
      "Department of Computer Science and Engineering with focus on software engineering, computing systems, data and emerging technologies.",
    courses: [
      {
        name: "B.E. Computer Science and Engineering",
        code: "BE-CSE",
        durationYears: 4,
        semesters: [
          "Semester 1",
          "Semester 2",
          "Semester 3",
          "Semester 4",
          "Semester 5",
          "Semester 6",
          "Semester 7",
          "Semester 8",
        ],
      },
    ],
  },
  {
    name: "Electronics and Communication Engineering",
    code: "ECE",
    description:
      "Department of Electronics and Communication Engineering covering electronics, communication systems and embedded technologies.",
    courses: [
      {
        name: "B.E. Electronics and Communication Engineering",
        code: "BE-ECE",
        durationYears: 4,
        semesters: [
          "Semester 1",
          "Semester 2",
          "Semester 3",
          "Semester 4",
          "Semester 5",
          "Semester 6",
          "Semester 7",
          "Semester 8",
        ],
      },
    ],
  },
  {
    name: "Electrical and Electronics Engineering",
    code: "EEE",
    description:
      "Department of Electrical and Electronics Engineering covering electrical systems, power systems, control and electronics.",
    courses: [
      {
        name: "B.E. Electrical and Electronics Engineering",
        code: "BE-EEE",
        durationYears: 4,
        semesters: [
          "Semester 1",
          "Semester 2",
          "Semester 3",
          "Semester 4",
          "Semester 5",
          "Semester 6",
          "Semester 7",
          "Semester 8",
        ],
      },
    ],
  },
  {
    name: "Mechanical Engineering",
    code: "MECH",
    description:
      "Department of Mechanical Engineering covering design, manufacturing, thermal engineering and industrial systems.",
    courses: [
      {
        name: "B.E. Mechanical Engineering",
        code: "BE-MECH",
        durationYears: 4,
        semesters: [
          "Semester 1",
          "Semester 2",
          "Semester 3",
          "Semester 4",
          "Semester 5",
          "Semester 6",
          "Semester 7",
          "Semester 8",
        ],
      },
    ],
  },
  {
    name: "Civil Engineering",
    code: "CIVIL",
    description:
      "Department of Civil Engineering covering structural engineering, construction, infrastructure and environmental engineering.",
    courses: [
      {
        name: "B.E. Civil Engineering",
        code: "BE-CIVIL",
        durationYears: 4,
        semesters: [
          "Semester 1",
          "Semester 2",
          "Semester 3",
          "Semester 4",
          "Semester 5",
          "Semester 6",
          "Semester 7",
          "Semester 8",
        ],
      },
    ],
  },
  {
    name: "Information Technology",
    code: "IT",
    description:
      "Department of Information Technology focused on information systems, application development, cloud and digital technologies.",
    courses: [
      {
        name: "B.Tech Information Technology",
        code: "BTECH-IT",
        durationYears: 4,
        semesters: [
          "Semester 1",
          "Semester 2",
          "Semester 3",
          "Semester 4",
          "Semester 5",
          "Semester 6",
          "Semester 7",
          "Semester 8",
        ],
      },
    ],
  },
  {
    name: "Artificial Intelligence and Data Science",
    code: "AIDS",
    description:
      "Department of Artificial Intelligence and Data Science focused on AI, machine learning, analytics and intelligent computing.",
    courses: [
      {
        name: "B.Tech Artificial Intelligence and Data Science",
        code: "BTECH-AIDS",
        durationYears: 4,
        semesters: [
          "Semester 1",
          "Semester 2",
          "Semester 3",
          "Semester 4",
          "Semester 5",
          "Semester 6",
          "Semester 7",
          "Semester 8",
        ],
      },
    ],
  },
];

async function main() {
  console.log("\n========================================");
  console.log(" CAMPUSMIND AI - ACADEMIC MASTER SEED");
  console.log("========================================\n");

  let departmentCount = 0;
  let courseCount = 0;
  let semesterCount = 0;

  for (const departmentData of departments) {
    const department = await prisma.department.upsert({
      where: {
        code: departmentData.code,
      },
      update: {
        name: departmentData.name,
        description: departmentData.description,
        active: true,
      },
      create: {
        name: departmentData.name,
        code: departmentData.code,
        description: departmentData.description,
        active: true,
      },
    });

    departmentCount++;

    console.log(
      `✓ Department: ${department.name} (${department.code})`
    );

    for (const courseData of departmentData.courses) {
      const course = await prisma.course.upsert({
        where: {
          code: courseData.code,
        },
        update: {
          name: courseData.name,
          durationYears: courseData.durationYears,
          departmentId: department.id,
          active: true,
        },
        create: {
          name: courseData.name,
          code: courseData.code,
          durationYears: courseData.durationYears,
          departmentId: department.id,
          active: true,
        },
      });

      courseCount++;

      console.log(`  ✓ Course: ${course.name}`);

      for (let index = 0; index < courseData.semesters.length; index++) {
        const semesterNumber = index + 1;
        const semesterName = courseData.semesters[index];

        await prisma.semester.upsert({
          where: {
            courseId_number: {
              courseId: course.id,
              number: semesterNumber,
            },
          },
          update: {
            name: semesterName,
            active: true,
          },
          create: {
            name: semesterName,
            number: semesterNumber,
            courseId: course.id,
            active: true,
          },
        });

        semesterCount++;
      }

      console.log(
        `    ✓ Semesters: ${courseData.semesters.length}`
      );
    }

    console.log("");
  }

  console.log("========================================");
  console.log(" SEED COMPLETED");
  console.log("========================================");
  console.log(`Departments : ${departmentCount}`);
  console.log(`Courses     : ${courseCount}`);
  console.log(`Semesters   : ${semesterCount}`);
  console.log("========================================\n");
}

main()
  .catch((error) => {
    console.error("\n❌ ACADEMIC SEED FAILED\n");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
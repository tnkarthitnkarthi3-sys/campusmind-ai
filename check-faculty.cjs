const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

require("dotenv/config");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const faculty = await prisma.user.findMany({
    where: {
      role: "FACULTY",
    },
    select: {
      name: true,
      email: true,
      role: true,
      departmentId: true,
    },
  });

  console.table(faculty);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

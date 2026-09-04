import "dotenv/config";
import bcrypt from "bcryptjs";
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
  const email = "faculty@campusmind.ai";
  const password = "faculty123";

  const passwordHash = await bcrypt.hash(password, 12);

  const faculty = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name: "CampusMind Faculty",
      passwordHash,
      role: "FACULTY",
    },
    create: {
      name: "CampusMind Faculty",
      email,
      passwordHash,
      role: "FACULTY",
    },
  });

  console.log("");
  console.log("======================================");
  console.log("CampusMind AI Faculty Account");
  console.log("======================================");
  console.log("Name     :", faculty.name);
  console.log("Email    :", faculty.email);
  console.log("Password : faculty123");
  console.log("Role     :", faculty.role);
  console.log("ID       :", faculty.id);
  console.log("======================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
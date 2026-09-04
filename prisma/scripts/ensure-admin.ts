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
  const email = "karthiadmin@gmail.com";
  const password = "adminkarthi";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name: "Karthi Admin",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      name: "Karthi Admin",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("");
  console.log("======================================");
  console.log("CampusMind AI Admin Account");
  console.log("======================================");
  console.log("Email    :", admin.email);
  console.log("Role     :", admin.role);
  console.log("Admin ID :", admin.id);
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
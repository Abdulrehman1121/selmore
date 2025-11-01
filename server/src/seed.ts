import prisma from "../src/prismaClient";
import bcrypt from "bcrypt";

async function main() {
  const password = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "Admin", email: "admin@example.com", password, role: "admin" }
  });
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: { name: "Owner", email: "owner@example.com", password, role: "owner" }
  });
  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: { name: "Client", email: "client@example.com", password, role: "client" }
  });

  await prisma.billboard.createMany({
    data: [
      { ownerId: owner.id, title: "Times Square", location: "New York, NY", type: "Digital", price: 800, priceType: "day", bookingType: "direct" },
      // add more...
    ]
  });

  console.log("Seed done");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

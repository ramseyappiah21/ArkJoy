const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const accounts = [
    {
      name: "Ramsey Appiah",
      email: "ramseyappiah21@gmail.com",
      role: "manager",
    },
    {
      name: "Maya Manager",
      email: "manager@arkjoy.local",
      role: "manager",
    },
    {
      name: "Chris Cashier",
      email: "cashier@arkjoy.local",
      role: "cashier",
    },
    {
      name: "Kelly Kitchen",
      email: "kitchen@arkjoy.local",
      role: "kitchen",
    },
  ];

  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      create: {
        name: account.name,
        email: account.email,
        role: account.role,
        passwordHash,
      },
      update: {
        name: account.name,
        role: account.role,
        passwordHash,
      },
    });
    console.log("ready", account.email, account.role);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

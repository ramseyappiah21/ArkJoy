const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, passwordHash: true, name: true },
  });
  console.log("userCount", users.length);
  for (const u of users) {
    const ok = await bcrypt.compare("password123", u.passwordHash);
    console.log({
      email: u.email,
      role: u.role,
      password123Matches: ok,
      hashPrefix: u.passwordHash.slice(0, 12),
    });
  }
  if (users.length === 0) {
    console.log("NO_USERS — reseeding");
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

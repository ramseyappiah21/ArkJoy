const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const prices = {
  "Jollof rice": 6500,
  Waakye: 5500,
  "Banku with okro stew": 6000,
  "Grilled tilapia": 9500,
  "Red red": 5000,
  "Kenkey with fried fish": 5500,
  "Fufu with light soup": 7500,
  "Fufu with groundnut soup": 8000,
  "Gari foto": 3500,
  Kelewele: 2500,
  "Fried plantain": 2000,
  "Extra shito": 1000,
  Sobolo: 1500,
  Asana: 1200,
};

async function main() {
  for (const [name, priceCents] of Object.entries(prices)) {
    const r = await prisma.menuItem.updateMany({
      where: { name },
      data: { priceCents },
    });
    console.log(name, r.count ? `→ GH₵${(priceCents / 100).toFixed(2)}` : "missing");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

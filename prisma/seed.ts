import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Local dish photos in /public/menu */
const IMG = {
  jollof: "/menu/jollof.jpg",
  waakye: "/menu/waakye.jpg",
  banku: "/menu/banku.jpg",
  fufu: "/menu/fufu.jpg",
  tilapia: "/menu/tilapia.jpg",
  redRed: "/menu/red-red.jpg",
  kelewele: "/menu/kelewele.jpg",
  kenkey: "/menu/kenkey.jpg",
  groundnut: "/menu/groundnut.jpg",
  plantain: "/menu/plantain.jpg",
  sobolo: "/menu/sobolo.jpg",
  asana: "/menu/asana.jpg",
  shito: "/menu/shito.jpg",
  gari: "/menu/gari.jpg",
};

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("Database already has users — skipping seed.");
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Ramsey Appiah",
        email: "ramseyappiah21@gmail.com",
        passwordHash,
        role: "manager",
      },
      {
        name: "Maya Manager",
        email: "manager@arkjoy.local",
        passwordHash,
        role: "manager",
      },
      {
        name: "Chris Cashier",
        email: "cashier@arkjoy.local",
        passwordHash,
        role: "cashier",
      },
      {
        name: "Kelly Kitchen",
        email: "kitchen@arkjoy.local",
        passwordHash,
        role: "kitchen",
      },
    ],
  });

  await prisma.appMeta.create({
    data: { id: "singleton", nextOrderNumber: 1 },
  });

  const ingredients = await Promise.all(
    [
      { name: "Rice portion", unit: "pcs", stockQty: 120, lowStockAt: 25 },
      { name: "Beans portion", unit: "pcs", stockQty: 90, lowStockAt: 20 },
      { name: "Banku ball", unit: "pcs", stockQty: 80, lowStockAt: 15 },
      { name: "Fufu ball", unit: "pcs", stockQty: 70, lowStockAt: 14 },
      { name: "Kenkey wrap", unit: "pcs", stockQty: 60, lowStockAt: 12 },
      { name: "Plantain", unit: "pcs", stockQty: 100, lowStockAt: 20 },
      { name: "Tilapia", unit: "pcs", stockQty: 50, lowStockAt: 10 },
      { name: "Goat meat", unit: "g", stockQty: 8000, lowStockAt: 1500 },
      { name: "Chicken", unit: "pcs", stockQty: 80, lowStockAt: 15 },
      { name: "Okro stew base", unit: "pcs", stockQty: 70, lowStockAt: 15 },
      { name: "Light soup base", unit: "pcs", stockQty: 70, lowStockAt: 15 },
      { name: "Groundnut soup base", unit: "pcs", stockQty: 60, lowStockAt: 12 },
      { name: "Gari portion", unit: "pcs", stockQty: 90, lowStockAt: 20 },
      { name: "Sobolo liter", unit: "ml", stockQty: 8000, lowStockAt: 1500 },
      { name: "Cup", unit: "pcs", stockQty: 200, lowStockAt: 40 },
    ].map((i) => prisma.ingredient.create({ data: i }))
  );

  const byName = Object.fromEntries(ingredients.map((i) => [i.name, i]));

  const ghanaian = await prisma.category.create({
    data: { name: "Ghanaian favourites", sortOrder: 1 },
  });
  const soups = await prisma.category.create({
    data: { name: "Soups & swallows", sortOrder: 2 },
  });
  const sides = await prisma.category.create({
    data: { name: "Sides & snacks", sortOrder: 3 },
  });
  const drinks = await prisma.category.create({
    data: { name: "Drinks", sortOrder: 4 },
  });

  await prisma.menuItem.create({
    data: {
      name: "Jollof rice",
      description:
        "Party-style Ghanaian jollof with fragrant tomato stew — choose chicken or beef.",
      priceCents: 6500,
      imageUrl: IMG.jollof,
      categoryId: ghanaian.id,
      modifiers: {
        create: [
          {
            name: "Protein",
            required: true,
            modifiers: {
              create: [
                { name: "Chicken", priceCents: 0 },
                { name: "Beef", priceCents: 500 },
                { name: "Goat", priceCents: 800 },
              ],
            },
          },
        ],
      },
      recipeLines: {
        create: [
          { ingredientId: byName["Rice portion"].id, qty: 1 },
          { ingredientId: byName["Chicken"].id, qty: 1 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Waakye",
      description:
        "Rice and beans cooked in sorghum leaf, served with spaghetti, egg, and shito.",
      priceCents: 5500,
      imageUrl: IMG.waakye,
      categoryId: ghanaian.id,
      recipeLines: {
        create: [
          { ingredientId: byName["Rice portion"].id, qty: 1 },
          { ingredientId: byName["Beans portion"].id, qty: 1 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Banku with okro stew",
      description:
        "Soft fermented corn banku and stretchy okro stew — a weekday classic.",
      priceCents: 6000,
      imageUrl: IMG.banku,
      categoryId: ghanaian.id,
      recipeLines: {
        create: [
          { ingredientId: byName["Banku ball"].id, qty: 2 },
          { ingredientId: byName["Okro stew base"].id, qty: 1 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Grilled tilapia",
      description:
        "Whole charcoal-grilled tilapia with banku or hot pepper and shito on the side.",
      priceCents: 9500,
      imageUrl: IMG.tilapia,
      categoryId: ghanaian.id,
      modifiers: {
        create: [
          {
            name: "Serve with",
            required: true,
            modifiers: {
              create: [
                { name: "Banku", priceCents: 0 },
                { name: "Fried yam", priceCents: 500 },
                { name: "Plain rice", priceCents: 0 },
              ],
            },
          },
        ],
      },
      recipeLines: {
        create: [
          { ingredientId: byName["Tilapia"].id, qty: 1 },
          { ingredientId: byName["Banku ball"].id, qty: 2 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Red red",
      description:
        "Black-eyed bean stew in palm oil with fried ripe plantain — comfort in a bowl.",
      priceCents: 5000,
      imageUrl: IMG.redRed,
      categoryId: ghanaian.id,
      recipeLines: {
        create: [
          { ingredientId: byName["Beans portion"].id, qty: 1 },
          { ingredientId: byName["Plantain"].id, qty: 3 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Kenkey with fried fish",
      description:
        "Ga kenkey, fried fish, fresh pepper, and shito — Accra street favourite.",
      priceCents: 5500,
      imageUrl: IMG.kenkey,
      categoryId: ghanaian.id,
      recipeLines: {
        create: [
          { ingredientId: byName["Kenkey wrap"].id, qty: 1 },
          { ingredientId: byName["Tilapia"].id, qty: 1 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Fufu with light soup",
      description:
        "Pounded fufu and aromatic light soup with goat or chicken.",
      priceCents: 7500,
      imageUrl: IMG.fufu,
      categoryId: soups.id,
      modifiers: {
        create: [
          {
            name: "Meat",
            required: true,
            modifiers: {
              create: [
                { name: "Goat", priceCents: 0 },
                { name: "Chicken", priceCents: 0 },
                { name: "Cowfoot", priceCents: 500 },
              ],
            },
          },
        ],
      },
      recipeLines: {
        create: [
          { ingredientId: byName["Fufu ball"].id, qty: 1 },
          { ingredientId: byName["Light soup base"].id, qty: 1 },
          { ingredientId: byName["Goat meat"].id, qty: 250 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Fufu with groundnut soup",
      description:
        "Rich groundnut (peanut) soup with fufu — Sunday family energy.",
      priceCents: 8000,
      imageUrl: IMG.groundnut,
      categoryId: soups.id,
      recipeLines: {
        create: [
          { ingredientId: byName["Fufu ball"].id, qty: 1 },
          { ingredientId: byName["Groundnut soup base"].id, qty: 1 },
          { ingredientId: byName["Chicken"].id, qty: 1 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Gari foto",
      description:
        "Moist gari stirred through tomato stew with sardine or egg.",
      priceCents: 3500,
      imageUrl: IMG.gari,
      categoryId: sides.id,
      recipeLines: {
        create: [{ ingredientId: byName["Gari portion"].id, qty: 1 }],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Kelewele",
      description:
        "Spiced fried ripe plantain with ginger and chili — perfect with groundnuts.",
      priceCents: 2500,
      imageUrl: IMG.kelewele,
      categoryId: sides.id,
      recipeLines: {
        create: [{ ingredientId: byName["Plantain"].id, qty: 2 }],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Fried plantain",
      description: "Golden soft plantain — the side everyone asks to share.",
      priceCents: 2000,
      imageUrl: IMG.plantain,
      categoryId: sides.id,
      recipeLines: {
        create: [{ ingredientId: byName["Plantain"].id, qty: 2 }],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Extra shito",
      description: "House black pepper sauce — smoky, spicy, addictive.",
      priceCents: 1000,
      imageUrl: IMG.shito,
      categoryId: sides.id,
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Sobolo",
      description:
        "Chilled hibiscus drink with ginger and pineapple — Ghana’s favourite cooler.",
      priceCents: 1500,
      imageUrl: IMG.sobolo,
      categoryId: drinks.id,
      recipeLines: {
        create: [
          { ingredientId: byName["Sobolo liter"].id, qty: 300 },
          { ingredientId: byName["Cup"].id, qty: 1 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Asana",
      description: "Sweet fermented corn drink — a classic Accra refreshment.",
      priceCents: 1200,
      imageUrl: IMG.asana,
      categoryId: drinks.id,
      recipeLines: {
        create: [{ ingredientId: byName["Cup"].id, qty: 1 }],
      },
    },
  });

  console.log("Seed complete — Ghanaian menu with photos.");
  console.log("Demo logins (password: password123):");
  console.log("  manager@arkjoy.local");
  console.log("  cashier@arkjoy.local");
  console.log("  kitchen@arkjoy.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

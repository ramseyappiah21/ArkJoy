import { prisma } from "@/lib/prisma";
import { PosClient } from "@/components/PosClient";

export default async function QuickOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        orderBy: { name: "asc" },
        include: {
          modifiers: { include: { modifiers: true } },
        },
      },
    },
  });

  const payload = categories.map((c) => ({
    id: c.id,
    name: c.name,
    items: c.items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      priceCents: i.priceCents,
      imageUrl: i.imageUrl,
      available: i.available,
      modifiers: i.modifiers.map((g) => ({
        id: g.id,
        name: g.name,
        required: g.required,
        options: g.modifiers.map((m) => ({
          id: m.id,
          name: m.name,
          priceCents: m.priceCents,
        })),
      })),
    })),
  }));

  const initialTable = sp.table ? Number(sp.table) : undefined;
  const initialType =
    sp.type === "takeout" ? "takeout" : ("dine_in" as const);

  return (
    <PosClient
      categories={payload}
      initialTable={initialTable}
      initialType={Number.isFinite(initialTable) ? "dine_in" : initialType}
    />
  );
}

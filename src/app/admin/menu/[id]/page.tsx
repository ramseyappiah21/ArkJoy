import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuItemForm } from "@/components/MenuItemForm";
import { requireSession } from "@/lib/session";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const canEditPrice = session.user.role === "manager";
  const { id } = await params;
  const [item, categories] = await Promise.all([
    prisma.menuItem.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!item) notFound();

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Edit {item.name}</h1>
          <p>
            {canEditPrice
              ? "Update photo, text, price, and availability."
              : "Update photo and text. Price can only be changed by a manager."}
          </p>
        </div>
      </header>

      <section className="panel" style={{ maxWidth: 640 }}>
        <MenuItemForm
          categories={categories}
          canEditPrice={canEditPrice}
          item={{
            id: item.id,
            name: item.name,
            description: item.description,
            priceCents: item.priceCents,
            imageUrl: item.imageUrl,
            categoryId: item.categoryId,
            available: item.available,
          }}
        />
      </section>
    </>
  );
}

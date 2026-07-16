"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function adjustStock(formData: FormData) {
  await requireSession(["manager"]);
  const id = String(formData.get("id"));
  const delta = Number(formData.get("delta"));
  const note = String(formData.get("note") ?? "").trim() || "Manual adjust";

  if (Number.isNaN(delta) || delta === 0) return;

  await prisma.$transaction(async (tx) => {
    const ingredient = await tx.ingredient.update({
      where: { id },
      data: { stockQty: { increment: delta } },
    });
    await tx.inventoryTxn.create({
      data: {
        ingredientId: id,
        type: delta > 0 ? "receive" : "adjust",
        qtyDelta: delta,
        note,
      },
    });
    if (ingredient.stockQty > 0) {
      await tx.menuItem.updateMany({
        where: {
          available: false,
          recipeLines: { some: { ingredientId: id } },
        },
        data: { available: true },
      });
    }
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/pos");
}

export async function createIngredient(formData: FormData) {
  await requireSession(["manager"]);
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const stockQty = Number(formData.get("stockQty") ?? 0);
  const lowStockAt = Number(formData.get("lowStockAt") ?? 5);
  if (!name || !unit) return;

  await prisma.ingredient.create({
    data: { name, unit, stockQty, lowStockAt },
  });
  revalidatePath("/admin/inventory");
}

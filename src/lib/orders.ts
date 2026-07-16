import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@/lib/types";

export async function nextOrderNumber(): Promise<number> {
  const meta = await prisma.appMeta.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", nextOrderNumber: 2 },
    update: { nextOrderNumber: { increment: 1 } },
  });
  return meta.nextOrderNumber - 1;
}

export async function completeOrderWithInventory(
  orderId: string,
  paymentMethod: PaymentMethod
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: { include: { recipeLines: true } },
            modifiers: true,
          },
        },
      },
    });

    if (!order) throw new Error("Order not found");
    if (order.status === "completed") throw new Error("Order already completed");
    if (order.status === "cancelled") throw new Error("Order is cancelled");

    const warnings: string[] = [];
    const deductions = new Map<string, number>();

    for (const item of order.items) {
      for (const line of item.menuItem.recipeLines) {
        const delta = line.qty * item.quantity;
        deductions.set(
          line.ingredientId,
          (deductions.get(line.ingredientId) ?? 0) + delta
        );
      }
    }

    for (const [ingredientId, qty] of deductions) {
      const ingredient = await tx.ingredient.findUnique({
        where: { id: ingredientId },
      });
      if (!ingredient) continue;
      const next = ingredient.stockQty - qty;
      if (next < 0) {
        warnings.push(
          `${ingredient.name} would go negative (${ingredient.stockQty} ${ingredient.unit} → ${next})`
        );
      }
      await tx.ingredient.update({
        where: { id: ingredientId },
        data: { stockQty: next },
      });
      await tx.inventoryTxn.create({
        data: {
          ingredientId,
          orderId: order.id,
          type: "sale",
          qtyDelta: -qty,
          note: `Order #${order.orderNumber}`,
        },
      });

      if (next <= 0) {
        await tx.menuItem.updateMany({
          where: {
            recipeLines: { some: { ingredientId } },
          },
          data: { available: false },
        });
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: "completed",
        paymentMethod,
        completedAt: new Date(),
      },
      include: {
        items: { include: { modifiers: true } },
      },
    });

    return { order: updated, warnings };
  });
}

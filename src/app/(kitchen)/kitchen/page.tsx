import { prisma } from "@/lib/prisma";
import { KitchenBoard } from "@/components/KitchenBoard";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["sent", "preparing", "ready"] } },
    include: { items: { include: { modifiers: true } } },
    orderBy: { createdAt: "asc" },
  });

  const payload = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    type: o.type,
    tableNumber: o.tableNumber,
    guestName: o.guestName,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      notes: i.notes,
      modifiers: i.modifiers.map((m) => m.name),
    })),
  }));

  return (
    <div className="kds-page">
      <header className="page-header kds-header">
        <div>
          <h1>Kitchen display</h1>
          <p>Oldest tickets first · age colors · all-day counts · bump to ready</p>
        </div>
      </header>
      <KitchenBoard initialOrders={payload} />
    </div>
  );
}

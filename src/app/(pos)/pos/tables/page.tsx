import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, orderTotalCents } from "@/lib/money";

const TABLE_COUNT = 12;

export default async function TablesPage() {
  const openOrders = await prisma.order.findMany({
    where: {
      type: "dine_in",
      status: { in: ["open", "sent", "preparing", "ready"] },
      tableNumber: { not: null },
    },
    include: { items: { include: { modifiers: true } } },
    orderBy: { createdAt: "asc" },
  });

  const byTable = new Map<number, (typeof openOrders)[0]>();
  for (const o of openOrders) {
    if (o.tableNumber != null && !byTable.has(o.tableNumber)) {
      byTable.set(o.tableNumber, o);
    }
  }

  const tables = Array.from({ length: TABLE_COUNT }, (_, i) => i + 1);

  return (
    <div className="floor-page">
      <header className="page-header">
        <div>
          <h1>Floor plan</h1>
          <p>Tap a free table to start a check, or open an occupied one.</p>
        </div>
        <Link href="/pos/order?type=takeout" className="btn">
          Takeout / pickup
        </Link>
      </header>

      <div className="floor-legend" aria-hidden="true">
        <span>
          <i className="dot free" /> Free
        </span>
        <span>
          <i className="dot busy" /> Occupied
        </span>
        <span>
          <i className="dot ready" /> Food ready
        </span>
      </div>

      <section className="floor-map" aria-label="Dining room tables">
        {tables.map((n) => {
          const order = byTable.get(n);
          const status = !order
            ? "free"
            : order.status === "ready"
              ? "ready"
              : "busy";
          const href = order
            ? "/pos/tickets"
            : `/pos/order?table=${n}`;

          return (
            <Link
              key={n}
              href={href}
              className={`floor-table ${status}`}
              aria-label={
                order
                  ? `Table ${n}, check #${order.orderNumber}, ${order.status}`
                  : `Table ${n}, free`
              }
            >
              <strong>T{n}</strong>
              {order ? (
                <>
                  <span className="floor-meta">#{order.orderNumber}</span>
                  <span className="floor-meta">
                    {formatMoney(orderTotalCents(order.items))}
                  </span>
                  <span className="badge">{order.status}</span>
                </>
              ) : (
                <span className="floor-meta">Seat guests</span>
              )}
            </Link>
          );
        })}
      </section>

      <aside className="panel" style={{ marginTop: "1.25rem" }}>
        <h2>Bar / counter</h2>
        <p>Quick-service and walk-ups use Quick order without a table.</p>
        <Link href="/pos/order" className="btn secondary">
          Open quick order
        </Link>
      </aside>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, orderTotalCents } from "@/lib/money";
import { CompleteOrderForm } from "@/components/CompleteOrderForm";

export default async function OpenTicketsPage() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["open", "sent", "preparing", "ready"] } },
    include: { items: { include: { modifiers: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="checks-page">
      <header className="page-header">
        <div>
          <h1>Open checks</h1>
          <p>Pay when ready — inventory deducts on close.</p>
        </div>
        <div className="row">
          <Link href="/pos/tables" className="btn secondary">
            Floor
          </Link>
          <Link href="/pos/order" className="btn">
            New check
          </Link>
        </div>
      </header>

      {orders.length === 0 ? (
        <p className="empty-state">No open checks.</p>
      ) : (
        <div className="ticket-board">
          {orders.map((o) => (
            <article key={o.id} className={`kitchen-ticket ${o.status}`}>
              <header>
                <h2>#{o.orderNumber}</h2>
                <span className="badge teal">{o.status}</span>
              </header>
              <p>
                {o.type === "dine_in"
                  ? `Table ${o.tableNumber ?? "—"}`
                  : `Takeout${o.guestName ? ` · ${o.guestName}` : ""}`}
                {o.notes ? ` · ${o.notes}` : ""}
              </p>
              <ul>
                {o.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.name}
                    {item.modifiers.length > 0 && (
                      <span className="mods">
                        {" "}
                        ({item.modifiers.map((m) => m.name).join(", ")})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p>
                <strong>{formatMoney(orderTotalCents(o.items))}</strong>
              </p>
              {(o.status === "ready" ||
                o.status === "sent" ||
                o.status === "preparing") && (
                <CompleteOrderForm orderId={o.id} />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

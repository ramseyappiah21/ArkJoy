import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, orderTotalCents } from "@/lib/money";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const to = sp.to ? new Date(sp.to) : new Date();
  const from = sp.from
    ? new Date(sp.from)
    : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      status: "completed",
      completedAt: { gte: from, lte: to },
    },
    include: { items: { include: { modifiers: true } } },
    orderBy: { completedAt: "desc" },
  });

  const revenue = orders.reduce((s, o) => s + orderTotalCents(o.items), 0);
  const itemCounts = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) {
    for (const item of o.items) {
      const mods = item.modifiers.reduce((m, x) => m + x.priceCents, 0);
      const line = (item.unitPriceCents + mods) * item.quantity;
      const cur = itemCounts.get(item.name) ?? {
        name: item.name,
        qty: 0,
        revenue: 0,
      };
      cur.qty += item.quantity;
      cur.revenue += line;
      itemCounts.set(item.name, cur);
    }
  }
  const topItems = [...itemCounts.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Sales</h1>
          <p>Completed orders, revenue, and top sellers.</p>
        </div>
        <a
          className="btn secondary"
          href={`/api/sales/export?from=${fromStr}&to=${toStr}`}
        >
          Export CSV
        </a>
      </header>

      <section className="panel">
        <form className="row" method="get">
          <label className="field">
            From
            <input type="date" name="from" defaultValue={fromStr} />
          </label>
          <label className="field">
            To
            <input type="date" name="to" defaultValue={toStr} />
          </label>
          <button type="submit" style={{ alignSelf: "flex-end" }}>
            Apply
          </button>
        </form>
      </section>

      <section className="grid-3" style={{ marginTop: "1rem" }} aria-label="Period stats">
        <article className="stat">
          <p className="label">Revenue</p>
          <p className="value">{formatMoney(revenue)}</p>
        </article>
        <article className="stat">
          <p className="label">Orders</p>
          <p className="value">{orders.length}</p>
        </article>
        <article className="stat">
          <p className="label">Avg ticket</p>
          <p className="value">
            {orders.length
              ? formatMoney(Math.round(revenue / orders.length))
              : formatMoney(0)}
          </p>
        </article>
      </section>

      <section className="grid-2" style={{ marginTop: "1rem" }}>
        <article className="panel">
          <h2>Top items</h2>
          {topItems.length === 0 ? (
            <p className="empty-state">No completed sales in this range.</p>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((i) => (
                  <tr key={i.name}>
                    <td>{i.name}</td>
                    <td>{i.qty}</td>
                    <td>{formatMoney(i.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel">
          <h2>Order history</h2>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>When</th>
                  <th>Type</th>
                  <th>Pay</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/sales`}>{o.orderNumber}</Link>
                    </td>
                    <td>{o.completedAt?.toLocaleString()}</td>
                    <td>
                      {o.type === "dine_in"
                        ? `Table ${o.tableNumber ?? "—"}`
                        : "Takeout"}
                    </td>
                    <td>{o.paymentMethod}</td>
                    <td>{formatMoney(orderTotalCents(o.items))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type KitchenOrder = {
  id: string;
  orderNumber: number;
  status: string;
  type: string;
  tableNumber: number | null;
  guestName: string | null;
  createdAt: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    notes: string | null;
    modifiers: string[];
  }[];
};

function ageMinutes(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

function ageClass(mins: number) {
  if (mins >= 15) return "age-hot";
  if (mins >= 8) return "age-warm";
  return "age-fresh";
}

export function KitchenBoard({
  initialOrders,
}: {
  initialOrders: KitchenOrder[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [, setTick] = useState(0);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/orders?status=kitchen");
    if (!res.ok) return;
    const data = await res.json();
    setOrders(data.orders);
  }, []);

  useEffect(() => {
    const poll = setInterval(refresh, 4000);
    const clock = setInterval(() => setTick((t) => t + 1), 15000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [refresh]);

  const allDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      if (o.status === "ready") continue;
      for (const item of o.items) {
        map.set(item.name, (map.get(item.name) ?? 0) + item.quantity);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [orders]);

  async function advance(orderId: string, status: string) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) refresh();
  }

  return (
    <div className="kds-screen">
      <aside className="kds-allday" aria-label="All day counts">
        <h2>All day</h2>
        {allDay.length === 0 ? (
          <p>No items firing.</p>
        ) : (
          <ul>
            {allDay.map(([name, qty]) => (
              <li key={name}>
                <strong>{qty}</strong> {name}
              </li>
            ))}
          </ul>
        )}
      </aside>

      <div className="kds-rail">
        {orders.length === 0 ? (
          <p className="empty-state kds-empty">Kitchen clear — waiting for tickets.</p>
        ) : (
          orders.map((o) => {
            const mins = ageMinutes(o.createdAt);
            return (
              <article
                key={o.id}
                className={`kds-ticket ${o.status} ${ageClass(mins)}`}
              >
                <header>
                  <div>
                    <h2>#{o.orderNumber}</h2>
                    <p>
                      {o.type === "dine_in"
                        ? `Table ${o.tableNumber ?? "—"}`
                        : `Takeout${o.guestName ? ` · ${o.guestName}` : ""}`}
                    </p>
                  </div>
                  <div className="kds-age">
                    <span className="timer">{mins}m</span>
                    <span className="badge">{o.status}</span>
                  </div>
                </header>
                <ul>
                  {o.items.map((item) => (
                    <li key={item.id}>
                      <strong>
                        {item.quantity}× {item.name}
                      </strong>
                      {item.modifiers.length > 0 && (
                        <div className="mods">{item.modifiers.join(", ")}</div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="kds-actions">
                  {o.status === "sent" && (
                    <button
                      type="button"
                      onClick={() => advance(o.id, "preparing")}
                    >
                      Start
                    </button>
                  )}
                  {o.status === "preparing" && (
                    <button
                      type="button"
                      className="bump"
                      onClick={() => advance(o.id, "ready")}
                    >
                      Bump
                    </button>
                  )}
                  {o.status === "ready" && (
                    <span className="badge ok">Ready — expo</span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

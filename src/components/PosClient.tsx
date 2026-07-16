"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/money";

type ModOption = { id: string; name: string; priceCents: number };
type ModGroup = {
  id: string;
  name: string;
  required: boolean;
  options: ModOption[];
};
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  available: boolean;
  modifiers: ModGroup[];
};
type Category = { id: string; name: string; items: MenuItem[] };

type CartLine = {
  key: string;
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  modifiers: { id: string; name: string; priceCents: number }[];
};

const TILE_COLORS = [
  "tile-a",
  "tile-b",
  "tile-c",
  "tile-d",
  "tile-e",
  "tile-f",
];

export function PosClient({
  categories,
  initialTable,
  initialType = "dine_in",
}: {
  categories: Category[];
  initialTable?: number;
  initialType?: "dine_in" | "takeout";
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [orderType, setOrderType] = useState<"dine_in" | "takeout">(initialType);
  const [tableNumber, setTableNumber] = useState(
    initialTable ? String(initialTable) : "1"
  );
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [selectedMods, setSelectedMods] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const items = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.items ?? [];
  }, [categories, categoryId]);

  const total = cart.reduce((sum, line) => {
    const mods = line.modifiers.reduce((m, x) => m + x.priceCents, 0);
    return sum + (line.unitPriceCents + mods) * line.quantity;
  }, 0);

  function openItem(item: MenuItem) {
    if (!item.available) return;
    if (item.modifiers.length === 0) {
      addToCart(item, []);
      return;
    }
    const defaults: Record<string, string> = {};
    for (const g of item.modifiers) {
      if (g.options[0]) defaults[g.id] = g.options[0].id;
    }
    setSelectedMods(defaults);
    setPendingItem(item);
  }

  function addToCart(
    item: MenuItem,
    mods: { id: string; name: string; priceCents: number }[]
  ) {
    const key = `${item.id}:${mods
      .map((m) => m.id)
      .sort()
      .join(",")}`;
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          key,
          menuItemId: item.id,
          name: item.name,
          unitPriceCents: item.priceCents,
          quantity: 1,
          modifiers: mods,
        },
      ];
    });
    setPendingItem(null);
  }

  function confirmModifiers() {
    if (!pendingItem) return;
    for (const g of pendingItem.modifiers) {
      if (g.required && !selectedMods[g.id]) {
        setError(`Choose an option for ${g.name}`);
        return;
      }
    }
    const mods = pendingItem.modifiers
      .map((g) => {
        const opt = g.options.find((o) => o.id === selectedMods[g.id]);
        return opt
          ? { id: opt.id, name: opt.name, priceCents: opt.priceCents }
          : null;
      })
      .filter(Boolean) as { id: string; name: string; priceCents: number }[];
    setError(null);
    addToCart(pendingItem, mods);
  }

  function changeQty(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + delta } : l
        )
        .filter((l) => l.quantity > 0)
    );
  }

  async function sendOrder() {
    if (cart.length === 0) {
      setError("Add at least one item.");
      return;
    }
    if (orderType === "dine_in" && !tableNumber) {
      setError("Enter a table number.");
      return;
    }
    setSending(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: orderType,
        tableNumber: orderType === "dine_in" ? Number(tableNumber) : null,
        guestName: orderType === "takeout" ? guestName || null : null,
        notes:
          orderType === "dine_in" ? `Guests: ${guestCount}` : undefined,
        items: cart.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          modifierIds: l.modifiers.map((m) => m.id),
        })),
        sendToKitchen: true,
      }),
    });
    setSending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create order");
      return;
    }
    setCart([]);
    router.push("/pos/tickets");
    router.refresh();
  }

  return (
    <div className="pos-terminal">
      <aside className="check-panel">
        <header className="check-header">
          <h1>Check</h1>
          <div className="check-toggles" role="group" aria-label="Order type">
            <button
              type="button"
              className={orderType === "dine_in" ? "on" : ""}
              onClick={() => setOrderType("dine_in")}
            >
              Dine-in
            </button>
            <button
              type="button"
              className={orderType === "takeout" ? "on" : ""}
              onClick={() => setOrderType("takeout")}
            >
              Takeout
            </button>
          </div>
        </header>

        {orderType === "dine_in" ? (
          <div className="check-meta">
            <label className="field">
              Table
              <input
                type="number"
                min={1}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </label>
            <label className="field">
              Guests
              <input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
              />
            </label>
          </div>
        ) : (
          <label className="field">
            Guest name
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Optional"
            />
          </label>
        )}

        <ul className="ticket-lines">
          {cart.length === 0 && (
            <li className="empty-check">Tap menu items to build the check.</li>
          )}
          {cart.map((line) => {
            const mods = line.modifiers.reduce((m, x) => m + x.priceCents, 0);
            const lineTotal = (line.unitPriceCents + mods) * line.quantity;
            return (
              <li key={line.key}>
                <div className="row spread">
                  <strong>
                    {line.quantity}× {line.name}
                  </strong>
                  <span>{formatMoney(lineTotal)}</span>
                </div>
                {line.modifiers.length > 0 && (
                  <p className="mods">
                    {line.modifiers.map((m) => m.name).join(", ")}
                  </p>
                )}
                <div className="qty-controls">
                  <button type="button" onClick={() => changeQty(line.key, -1)}>
                    −
                  </button>
                  <button type="button" onClick={() => changeQty(line.key, 1)}>
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <footer className="check-footer">
          <div className="ticket-total">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
          {error && (
            <p className="alert danger" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            className="send-btn"
            disabled={sending}
            onClick={sendOrder}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </footer>
      </aside>

      <section className="menu-panel">
        <div className="menu-categories" role="tablist" aria-label="Menus">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              role="tab"
              aria-pressed={categoryId === c.id}
              onClick={() => setCategoryId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="menu-grid terminal-grid">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`menu-tile ${TILE_COLORS[idx % TILE_COLORS.length]}`}
              disabled={!item.available}
              onClick={() => openItem(item)}
              style={
                item.imageUrl
                  ? {
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.72)), url(${item.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <strong>{item.name}</strong>
              {!item.available && <span className="badge danger">86</span>}
              <span className="price">{formatMoney(item.priceCents)}</span>
            </button>
          ))}
        </div>
      </section>

      {pendingItem && (
        <dialog className="modal terminal-modal" open>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmModifiers();
            }}
          >
            <h2>{pendingItem.name}</h2>
            {pendingItem.modifiers.map((g) => (
              <fieldset
                key={g.id}
                style={{
                  border: "none",
                  padding: 0,
                  marginBottom: "0.85rem",
                }}
              >
                <legend style={{ fontWeight: 700, marginBottom: "0.35rem" }}>
                  {g.name}
                  {g.required ? " *" : ""}
                </legend>
                {g.options.map((o) => (
                  <label
                    key={o.id}
                    className="field"
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <input
                      type="radio"
                      name={g.id}
                      checked={selectedMods[g.id] === o.id}
                      onChange={() =>
                        setSelectedMods((s) => ({ ...s, [g.id]: o.id }))
                      }
                    />
                    {o.name}
                    {o.priceCents > 0
                      ? ` (+${formatMoney(o.priceCents)})`
                      : ""}
                  </label>
                ))}
              </fieldset>
            ))}
            <div className="actions">
              <button type="submit">Add to check</button>
              <button
                type="button"
                className="secondary"
                onClick={() => setPendingItem(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
}

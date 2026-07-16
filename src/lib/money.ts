export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(cents / 100);
}

export function orderTotalCents(
  items: { unitPriceCents: number; quantity: number; modifiers?: { priceCents: number }[] }[]
): number {
  return items.reduce((sum, item) => {
    const mods = (item.modifiers ?? []).reduce((m, x) => m + x.priceCents, 0);
    return sum + (item.unitPriceCents + mods) * item.quantity;
  }, 0);
}

export const ROLE_HOME: Record<string, string> = {
  manager: "/admin",
  cashier: "/admin",
  kitchen: "/admin",
};

/** Staff roles that share the same back-office interface */
export const STAFF_ROLES = ["manager", "cashier", "kitchen"] as const;

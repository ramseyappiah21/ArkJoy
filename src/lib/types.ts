export type Role = "manager" | "cashier" | "kitchen";
export type OrderType = "dine_in" | "takeout";
export type OrderStatus =
  | "open"
  | "sent"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";
export type PaymentMethod = "cash" | "card" | "unpaid";
export type InventoryTxnType = "sale" | "adjust" | "receive";

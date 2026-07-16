"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CompleteOrderForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function complete(paymentMethod: "cash" | "card") {
    setLoading(true);
    setError(null);
    setWarnings([]);
    const res = await fetch(`/api/orders/${orderId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not complete order");
      return;
    }
    if (data.warnings?.length) setWarnings(data.warnings);
    router.refresh();
  }

  return (
    <div>
      {error && (
        <p className="alert danger" role="alert">
          {error}
        </p>
      )}
      {warnings.length > 0 && (
        <div className="alert warn" role="status">
          <strong>Inventory warnings</strong>
          <ul>
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="actions">
        <button type="button" disabled={loading} onClick={() => complete("cash")}>
          Pay cash
        </button>
        <button
          type="button"
          className="secondary"
          disabled={loading}
          onClick={() => complete("card")}
        >
          Pay card
        </button>
      </div>
    </div>
  );
}

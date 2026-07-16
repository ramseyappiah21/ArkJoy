import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PosHubPage() {
  const openCount = await prisma.order.count({
    where: { status: { in: ["open", "sent", "preparing", "ready"] } },
  });
  const kitchenCount = await prisma.order.count({
    where: { status: { in: ["sent", "preparing"] } },
  });

  return (
    <div className="mode-hub">
      <header className="page-header">
        <div>
          <h1>Front of house</h1>
          <p>Choose a mode — like Toast Quick Order, Tables, and Checks.</p>
        </div>
      </header>

      <section className="mode-grid" aria-label="POS modes">
        <Link href="/pos/order" className="mode-card mode-quick">
          <h2>Quick order</h2>
          <p>Fast-casual terminal. Build a check and fire to the kitchen.</p>
          <span className="mode-cta">Open terminal</span>
        </Link>
        <Link href="/pos/tables" className="mode-card mode-tables">
          <h2>Tables</h2>
          <p>Floor map with open / free tables for dine-in service.</p>
          <span className="mode-cta">View floor</span>
        </Link>
        <Link href="/pos/tickets" className="mode-card mode-checks">
          <h2>Open checks</h2>
          <p>
            {openCount} active check{openCount === 1 ? "" : "s"} — take payment
            when guests are ready.
          </p>
          <span className="mode-cta">Manage checks</span>
        </Link>
        <Link href="/kitchen" className="mode-card mode-kds">
          <h2>Kitchen display</h2>
          <p>
            {kitchenCount} ticket{kitchenCount === 1 ? "" : "s"} cooking — bump
            and age timers.
          </p>
          <span className="mode-cta">Open KDS</span>
        </Link>
      </section>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [newReservations, totalReservations, menuCount, unavailable] =
    await Promise.all([
      prisma.reservation.count({ where: { status: "requested" } }),
      prisma.reservation.count(),
      prisma.menuItem.count(),
      prisma.menuItem.count({ where: { available: false } }),
    ]);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Back office</h1>
          <p>Manage guest reservations and the menu for ArkJoy.</p>
        </div>
        <div className="row">
          <Link href="/admin/reservations" className="btn">
            Reservations
            {newReservations > 0 ? ` (${newReservations})` : ""}
          </Link>
          <Link href="/admin/menu" className="btn secondary">
            Edit menu
          </Link>
        </div>
      </header>

      {newReservations > 0 && (
        <p className="alert warn" role="status">
          {newReservations} new table request
          {newReservations === 1 ? "" : "s"} waiting.{" "}
          <Link href="/admin/reservations">Open reservations →</Link>
        </p>
      )}

      <section className="grid-2" aria-label="Overview">
        <article className="stat">
          <p className="label">New reservation requests</p>
          <p className="value">{newReservations}</p>
        </article>
        <article className="stat">
          <p className="label">Total reservations</p>
          <p className="value">{totalReservations}</p>
        </article>
      </section>

      <section className="grid-2" style={{ marginTop: "1rem" }}>
        <article className="panel">
          <h2>Guest reservations</h2>
          <p>
            {newReservations === 0
              ? "No new requests right now."
              : `${newReservations} new request${
                  newReservations === 1 ? "" : "s"
                } waiting for you.`}
          </p>
          <Link href="/admin/reservations" className="btn secondary">
            Open reservations
          </Link>
        </article>

        <article className="panel">
          <h2>Menu photos &amp; text</h2>
          <p>
            {menuCount} dish{menuCount === 1 ? "" : "es"} on the menu
            {unavailable > 0 ? ` · ${unavailable} hidden` : ""}.
          </p>
          <Link href="/admin/menu" className="btn secondary">
            Edit menu
          </Link>
        </article>
      </section>
    </>
  );
}

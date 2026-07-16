import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  updateReservationStatus,
  deleteReservation,
} from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  requested: "New request",
  confirmed: "Confirmed",
  seated: "Seated",
  cancelled: "Cancelled",
};

export default async function ReservationsAdminPage() {
  const reservations = await prisma.reservation.findMany({
    orderBy: [{ date: "asc" }, { time: "asc" }, { createdAt: "desc" }],
  });

  const pending = reservations.filter((r) => r.status === "requested");
  const upcoming = reservations.filter((r) =>
    ["confirmed", "seated"].includes(r.status)
  );
  const closed = reservations.filter((r) => r.status === "cancelled");

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Guest reservations</h1>
          <p>
            Staff-only inbox for table requests from the website. Guests cannot
            see this page.
          </p>
        </div>
        <Link href="/admin/menu" className="btn secondary">
          Edit menu
        </Link>
      </header>

      <section className="grid-3" aria-label="Reservation counts">
        <article className="stat">
          <p className="label">New requests</p>
          <p className="value">{pending.length}</p>
        </article>
        <article className="stat">
          <p className="label">Confirmed / seated</p>
          <p className="value">{upcoming.length}</p>
        </article>
        <article className="stat">
          <p className="label">Cancelled</p>
          <p className="value">{closed.length}</p>
        </article>
      </section>

      {reservations.length === 0 ? (
        <p className="empty-state" style={{ marginTop: "1rem" }}>
          No reservation requests yet. When a guest uses Reserve on the website,
          their details appear here.
        </p>
      ) : (
        <div className="reservation-board">
          {reservations.map((r) => (
            <article
              key={r.id}
              className={`reservation-card status-${r.status}`}
            >
              <header>
                <div>
                  <h2>{r.name}</h2>
                  <p className="reservation-when">
                    {r.date} at {r.time} · {r.partySize} guest
                    {r.partySize === 1 ? "" : "s"}
                  </p>
                </div>
                <span className={`badge ${badgeClass(r.status)}`}>
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
              </header>

              <dl className="reservation-details">
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                  </dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${r.phone}`}>{r.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt>Notes</dt>
                  <dd>{r.notes?.trim() ? r.notes : "None"}</dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{r.createdAt.toLocaleString()}</dd>
                </div>
              </dl>

              <div className="actions">
                {r.status !== "confirmed" && (
                  <form action={updateReservationStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="confirmed" />
                    <button type="submit">Confirm</button>
                  </form>
                )}
                {r.status !== "seated" && r.status !== "cancelled" && (
                  <form action={updateReservationStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="seated" />
                    <button type="submit" className="secondary">
                      Mark seated
                    </button>
                  </form>
                )}
                {r.status !== "cancelled" && (
                  <form action={updateReservationStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    <button type="submit" className="secondary">
                      Cancel
                    </button>
                  </form>
                )}
                <form action={deleteReservation}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="danger">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function badgeClass(status: string) {
  if (status === "confirmed" || status === "seated") return "ok";
  if (status === "cancelled") return "danger";
  return "warn";
}

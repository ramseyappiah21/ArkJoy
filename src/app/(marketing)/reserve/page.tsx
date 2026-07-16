import type { Metadata } from "next";
import { submitReservation } from "../actions";

export const metadata: Metadata = {
  title: "Reserve",
};

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <>
      <header className="guest-page-hero">
        <div
          className="guest-hero-media"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(12,11,10,0.55), rgba(12,11,10,0.8)), url("https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=2000&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        <div>
          <h1>Reserve a table</h1>
          <div className="guest-hero-line" aria-hidden="true" />
          <p>Send a request and we’ll confirm your place shortly.</p>
        </div>
      </header>

      <section className="guest-section">
        <div className="guest-section-inner">
          {sp.ok === "1" && (
            <p className="guest-alert" role="status">
              Thank you — we received your reservation request and will be in
              touch soon.
            </p>
          )}
          {sp.error === "1" && (
            <p className="guest-alert error" role="alert">
              Please complete all required fields and try again.
            </p>
          )}

          <form className="guest-form" action={submitReservation}>
            <label>
              Your name *
              <input name="name" required autoComplete="name" />
            </label>
            <div className="guest-form-row">
              <label>
                Date *
                <input name="date" type="date" required />
              </label>
              <label>
                Time *
                <input name="time" type="time" required />
              </label>
            </div>
            <label>
              Party size *
              <input
                name="partySize"
                type="number"
                min={1}
                max={20}
                defaultValue={2}
                required
              />
            </label>
            <div className="guest-form-row">
              <label>
                Email *
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                Phone *
                <input name="phone" type="tel" required autoComplete="tel" />
              </label>
            </div>
            <label>
              Special requests
              <textarea
                name="notes"
                placeholder="Allergies, celebrations, accessibility needs…"
              />
            </label>
            <button type="submit" className="guest-btn guest-btn-primary">
              Submit request
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

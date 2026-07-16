import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <header className="guest-page-hero">
        <div
          className="guest-hero-media"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(12,11,10,0.55), rgba(12,11,10,0.8)), url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2000&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        <div>
          <h1>Get in touch</h1>
          <div className="guest-hero-line" aria-hidden="true" />
          <p>We’d love to host you — or help plan your next gathering.</p>
        </div>
      </header>

      <section className="guest-section">
        <div className="guest-section-inner guest-split">
          <div>
            <p className="guest-kicker">Visit</p>
            <h2>Find us</h2>
            <p>
              Buoho, Kumasi
              <br />
              Afigya Kwabre District
              <br />
              Obuasi · AN524 Ivory Street
            </p>
            <p>
              <a href="tel:+233546774063">+233 54 677 4063</a>
              <br />
              <a href="mailto:ramseyappiah21@gmail.com">
                ramseyappiah21@gmail.com
              </a>
            </p>
            <p className="guest-kicker" style={{ marginTop: "2rem" }}>
              Hours
            </p>
            <p>
              Monday–Saturday · 12:00pm–9:00pm
              <br />
              Sunday · Closed
            </p>
          </div>
          <div>
            <p className="guest-kicker">Book</p>
            <h2>Ready when you are</h2>
            <p>
              Large parties, allergies, and celebrations — note them when you
              reserve and we’ll do our best to prepare.
            </p>
            <p style={{ marginTop: "1.25rem" }}>
              <Link href="/reserve" className="guest-btn guest-btn-primary">
                Request a reservation
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our story",
};

export default function StoryPage() {
  return (
    <>
      <header className="guest-page-hero">
        <div
          className="guest-hero-media"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(12,11,10,0.5), rgba(12,11,10,0.78)), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        <div>
          <h1>Our story</h1>
          <div className="guest-hero-line" aria-hidden="true" />
          <p>Through our eyes — a kitchen built for lingering.</p>
        </div>
      </header>

      <section className="guest-section">
        <div className="guest-section-inner" style={{ maxWidth: "40rem" }}>
          <p className="guest-kicker">The restaurant</p>
          <h2>Why ArkJoy</h2>
          <p>
            We opened ArkJoy for the evenings when you want something real —
            proper jollof, soft banku, a bowl of light soup, and a room that
            doesn’t rush you out. The name is a nod to the small joys that land
            on a plate when the kitchen is paying attention.
          </p>
          <p>
            Our cooks lean on Ghanaian favourites and everyday chop-bar
            classics. Menus shift with the market. Service stays personal.
            Whether you come for waakye at lunch or grilled tilapia after work,
            we hope you leave a little fuller than you arrived.
          </p>
          <p style={{ marginTop: "1.75rem" }}>
            <Link href="/reserve" className="guest-btn guest-btn-primary">
              Reserve a table
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

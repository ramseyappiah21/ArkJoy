import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function MarketingHomePage() {
  const highlights = await prisma.menuItem.findMany({
    where: { available: true, imageUrl: { not: null } },
    orderBy: { name: "asc" },
    take: 3,
  });

  return (
    <>
      <section className="guest-hero" aria-label="Welcome">
        <div
          className="guest-hero-media"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(12, 11, 10, 0.45) 0%, rgba(12, 11, 10, 0.72) 100%), url(/menu/jollof.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        <div className="guest-hero-content">
          <h1 className="guest-hero-brand">ArkJoy</h1>
          <div className="guest-hero-line" aria-hidden="true" />
          <p className="guest-hero-lead">
            Ghanaian plates cooked with care — jollof, waakye, banku, fufu, and
            a cold sobolo to finish.
          </p>
          <div className="guest-cta-row">
            <Link href="/reserve" className="guest-btn guest-btn-primary">
              Reserve a table
            </Link>
            <Link href="/menu" className="guest-btn guest-btn-ghost">
              View the menu
            </Link>
          </div>
        </div>
      </section>

      <section className="guest-section guest-band">
        <div className="guest-section-inner guest-split">
          <div className="guest-split-copy">
            <p className="guest-kicker">Our story</p>
            <h2>Home flavours, shared tables</h2>
            <p>
              ArkJoy brings the everyday Ghanaian table into one warm dining
              room — waakye for lunch, grilled tilapia in the evening, and
              kelewele when the night stretches on.
            </p>
            <p style={{ marginTop: "1.25rem" }}>
              <Link href="/story" className="guest-btn guest-btn-ghost">
                Read our story
              </Link>
            </p>
          </div>
          <div
            className="guest-split-visual"
            role="img"
            aria-label="Ghanaian-inspired dish at ArkJoy"
            style={{
              backgroundImage:
                "linear-gradient(160deg, rgba(12, 11, 10, 0.15), rgba(12, 11, 10, 0.35)), url(/menu/tilapia.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      </section>

      <section className="guest-section">
        <div className="guest-section-inner">
          <p className="guest-kicker">From the kitchen</p>
          <h2>A taste of Ghana</h2>
          <p>
            Favourites from Accra chop bars and family pots — updated live from
            our kitchen board.
          </p>
          <div className="guest-menu-preview">
            {highlights.map((item) => (
              <Link key={item.id} href="/menu" className="guest-preview-card">
                <div className="guest-preview-photo">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} />
                  )}
                </div>
                <h3>{item.name}</h3>
                <p>
                  {item.description
                    ? `${item.description.slice(0, 72)}${item.description.length > 72 ? "…" : ""}`
                    : formatMoney(item.priceCents)}
                </p>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: "2rem" }}>
            <Link href="/menu" className="guest-btn guest-btn-primary">
              Explore the menu
            </Link>
          </p>
        </div>
      </section>

      <section className="guest-section guest-band">
        <div className="guest-section-inner">
          <p className="guest-kicker">Visit us</p>
          <h2>Save your place at the table</h2>
          <p>
            Tell us when you’d like to come and how many will join you. We’ll
            confirm shortly.
          </p>
          <p style={{ marginTop: "1.5rem" }}>
            <Link href="/reserve" className="guest-btn guest-btn-primary">
              Request a reservation
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menu",
};

export default async function PublicMenuPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { available: true },
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <>
      <header className="guest-page-hero">
        <div
          className="guest-hero-media"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(12,11,10,0.5), rgba(12,11,10,0.75)), url(/menu/jollof.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        <div>
          <h1>Our menu</h1>
          <div className="guest-hero-line" aria-hidden="true" />
          <p>
            Ghanaian favourites from jollof and waakye to fufu, banku, and
            sobolo.
          </p>
        </div>
      </header>

      <section className="guest-section">
        <div className="guest-section-inner guest-menu-list">
          {categories.map((cat) => (
            <div key={cat.id} className="guest-menu-cat">
              <h2>{cat.name}</h2>
              {cat.items.length === 0 ? (
                <p>Ask about today’s availability.</p>
              ) : (
                <div className="guest-dish-grid">
                  {cat.items.map((item) => (
                    <article key={item.id} className="guest-dish-card">
                      <div className="guest-dish-photo">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.name} />
                        ) : (
                          <div className="guest-dish-photo-fallback" />
                        )}
                      </div>
                      <div className="guest-dish-body">
                        <div className="guest-dish-top">
                          <h3>{item.name}</h3>
                          <span className="guest-dish-price">
                            {formatMoney(item.priceCents)}
                          </span>
                        </div>
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

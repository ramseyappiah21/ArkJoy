import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { requireSession } from "@/lib/session";
import { toggleAvailability, deleteMenuItem } from "./actions";

export const dynamic = "force-dynamic";

export default async function MenuAdminPage() {
  const session = await requireSession();
  const isManager = session.user.role === "manager";
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        orderBy: { name: "asc" },
        include: {
          modifiers: { include: { modifiers: true } },
        },
      },
    },
  });

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Menu manager</h1>
          <p>
            Update dish names, descriptions, and photos
            {isManager ? ", and prices in cedis (GHS)" : ""}. Changes appear on
            the guest menu.
          </p>
        </div>
        {isManager && (
          <Link href="/admin/menu/new" className="btn">
            Add item
          </Link>
        )}
      </header>

      {categories.map((cat) => (
        <section
          key={cat.id}
          className="panel"
          aria-labelledby={`cat-${cat.id}`}
        >
          <h2 id={`cat-${cat.id}`}>{cat.name}</h2>
          <div className="staff-menu-grid">
            {cat.items.map((item) => (
              <article key={item.id} className="staff-menu-card">
                <div className="staff-menu-photo">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="staff-menu-photo-empty">No photo</div>
                  )}
                </div>
                <div className="staff-menu-body">
                  <div className="row spread">
                    <strong>{item.name}</strong>
                    <span>{formatMoney(item.priceCents)}</span>
                  </div>
                  <p className="hint">
                    {item.description ?? "No description yet."}
                  </p>
                  <span
                    className={`badge ${item.available ? "ok" : "danger"}`}
                  >
                    {item.available ? "Live" : "Hidden / 86'd"}
                  </span>
                  <div className="actions">
                    <Link href={`/admin/menu/${item.id}`} className="btn">
                      Edit photo & text
                      {isManager ? " & price" : ""}
                    </Link>
                    <form action={toggleAvailability}>
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        type="hidden"
                        name="available"
                        value={item.available ? "false" : "true"}
                      />
                      <button type="submit" className="secondary">
                        {item.available ? "Hide" : "Show"}
                      </button>
                    </form>
                    {isManager && (
                      <form action={deleteMenuItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="danger">
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

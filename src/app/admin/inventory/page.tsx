import { prisma } from "@/lib/prisma";
import { adjustStock, createIngredient } from "./actions";

export default async function InventoryPage() {
  const [ingredients, recent] = await Promise.all([
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
    prisma.inventoryTxn.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { ingredient: true },
    }),
  ]);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Stock levels, adjustments, and recent movements.</p>
        </div>
      </header>

      <section className="grid-2">
        <article className="panel">
          <h2>Ingredients</h2>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Stock</th>
                  <th>Low at</th>
                  <th>Adjust</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((i) => {
                  const low = i.stockQty <= i.lowStockAt;
                  return (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>
                        <span className={`badge ${low ? "warn" : "ok"}`}>
                          {i.stockQty} {i.unit}
                        </span>
                      </td>
                      <td>
                        {i.lowStockAt} {i.unit}
                      </td>
                      <td>
                        <form action={adjustStock} className="row">
                          <input type="hidden" name="id" value={i.id} />
                          <input
                            name="delta"
                            type="number"
                            step="any"
                            placeholder="+/- qty"
                            required
                            style={{ width: "6rem" }}
                          />
                          <input
                            name="note"
                            placeholder="Note"
                            style={{ width: "8rem" }}
                          />
                          <button type="submit" className="secondary">
                            Apply
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <div>
          <article className="panel">
            <h2>Add ingredient</h2>
            <form className="stack" action={createIngredient}>
              <label className="field">
                Name
                <input name="name" required />
              </label>
              <label className="field">
                Unit
                <input name="unit" placeholder="pcs, g, ml…" required />
              </label>
              <label className="field">
                Starting stock
                <input name="stockQty" type="number" step="any" defaultValue={0} />
              </label>
              <label className="field">
                Low-stock threshold
                <input name="lowStockAt" type="number" step="any" defaultValue={5} />
              </label>
              <button type="submit">Add ingredient</button>
            </form>
          </article>

          <article className="panel">
            <h2>Recent transactions</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Item</th>
                    <th>Delta</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id}>
                      <td>{t.createdAt.toLocaleString()}</td>
                      <td>{t.ingredient.name}</td>
                      <td>
                        {t.qtyDelta > 0 ? "+" : ""}
                        {t.qtyDelta}
                      </td>
                      <td>{t.note ?? t.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

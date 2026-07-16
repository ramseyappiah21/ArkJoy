import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuItemForm } from "@/components/MenuItemForm";
import { requireSession } from "@/lib/session";
import { createCategory } from "../actions";

export default async function NewMenuItemPage() {
  const session = await requireSession();
  if (session.user.role !== "manager") {
    redirect("/admin/menu");
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <header className="page-header">
        <div>
          <h1>New menu item</h1>
          <p>Add a dish with price in Ghana cedis (GHS).</p>
        </div>
      </header>

      <section className="grid-2">
        <article className="panel">
          <MenuItemForm categories={categories} canEditPrice />
        </article>

        <aside className="panel">
          <h2>New category</h2>
          <form className="stack" action={createCategory}>
            <label className="field">
              Name
              <input name="name" required />
            </label>
            <button type="submit" className="secondary">
              Add category
            </button>
          </form>
        </aside>
      </section>
    </>
  );
}

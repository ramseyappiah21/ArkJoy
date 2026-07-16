"use client";

import { useState } from "react";
import { saveMenuItem } from "@/app/admin/menu/actions";

type Category = { id: string; name: string };

export function MenuItemForm({
  categories,
  item,
  canEditPrice = false,
}: {
  categories: Category[];
  canEditPrice?: boolean;
  item?: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    imageUrl: string | null;
    categoryId: string;
    available: boolean;
  };
}) {
  const [preview, setPreview] = useState(item?.imageUrl ?? "");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="stack menu-edit-form"
      action={async (fd) => {
        setError(null);
        try {
          await saveMenuItem(fd);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not save item");
        }
      }}
    >
      {item && <input type="hidden" name="id" value={item.id} />}

      {error && (
        <p className="alert danger" role="alert">
          {error}
        </p>
      )}

      <section className="menu-edit-media panel">
        <h2>Dish photo</h2>
        <div className="menu-edit-preview">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Dish preview" />
          ) : (
            <div className="menu-edit-preview-empty">No photo yet</div>
          )}
        </div>
        <label className="field">
          Upload new photo
          <span className="hint">JPG, PNG, WEBP, or GIF · under 5MB</span>
          <input
            name="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setPreview(url);
            }}
          />
        </label>
        <label className="field">
          Or photo path / URL
          <span className="hint">
            Example: /menu/jollof.jpg or a full https link
          </span>
          <input
            name="imageUrl"
            type="text"
            placeholder="/menu/jollof.jpg"
            defaultValue={item?.imageUrl ?? ""}
            onChange={(e) => setPreview(e.target.value)}
          />
        </label>
      </section>

      <section className="panel stack">
        <h2>Dish details</h2>
        <label className="field">
          Name
          <input name="name" required defaultValue={item?.name ?? ""} />
        </label>
        <label className="field">
          Description
          <textarea
            name="description"
            rows={4}
            placeholder="Short guest-facing description"
            defaultValue={item?.description ?? ""}
          />
        </label>
        <label className="field">
          Price (GHS)
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required={canEditPrice}
            disabled={!canEditPrice}
            readOnly={!canEditPrice}
            defaultValue={
              item
                ? (item.priceCents / 100).toFixed(2)
                : canEditPrice
                  ? ""
                  : "0.00"
            }
          />
          {!canEditPrice && (
            <span className="hint">Only a manager can change the price.</span>
          )}
        </label>
        <label className="field">
          Category
          <select
            name="categoryId"
            required
            defaultValue={item?.categoryId ?? categories[0]?.id}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label
          className="field"
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <input
            name="available"
            type="checkbox"
            defaultChecked={item?.available ?? true}
          />
          Show on guest menu
        </label>
      </section>

      <button type="submit">{item ? "Save menu item" : "Create menu item"}</button>
    </form>
  );
}

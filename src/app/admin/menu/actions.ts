"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/money";
import { requireSession } from "@/lib/session";

export async function toggleAvailability(formData: FormData) {
  await requireSession([...STAFF_ROLES]);
  const id = String(formData.get("id"));
  const available = formData.get("available") === "true";
  await prisma.menuItem.update({ where: { id }, data: { available } });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  revalidatePath("/pos");
}

export async function deleteMenuItem(formData: FormData) {
  await requireSession(["manager"]);
  const id = String(formData.get("id"));
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  redirect("/admin/menu");
}

async function saveUploadedImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const type = file.type || "";
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(type)) {
    throw new Error("Please upload a JPG, PNG, WEBP, or GIF image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be under 5MB.");
  }

  const ext =
    type === "image/png"
      ? "png"
      : type === "image/webp"
        ? "webp"
        : type === "image/gif"
          ? "gif"
          : "jpg";

  const dir = path.join(process.cwd(), "public", "menu", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `dish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `/menu/uploads/${filename}`;
}

export async function saveMenuItem(formData: FormData) {
  const session = await requireSession([...STAFF_ROLES]);
  const isManager = session.user.role === "manager";
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const categoryId = String(formData.get("categoryId"));
  const available = formData.get("available") === "on";
  const uploaded = formData.get("imageFile");

  if (!name || !categoryId) {
    throw new Error("Invalid menu item data");
  }

  let priceCents: number;
  if (isManager) {
    priceCents = Math.round(Number(formData.get("price")) * 100);
    if (Number.isNaN(priceCents) || priceCents < 0) {
      throw new Error("Enter a valid price in cedis.");
    }
  } else if (id) {
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) throw new Error("Menu item not found");
    priceCents = existing.priceCents;
  } else {
    throw new Error("Only a manager can set the price for a new dish.");
  }

  if (uploaded instanceof File && uploaded.size > 0) {
    const uploadedPath = await saveUploadedImage(uploaded);
    if (uploadedPath) imageUrl = uploadedPath;
  }

  if (id) {
    await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl,
        ...(isManager ? { priceCents } : {}),
        categoryId,
        available,
      },
    });
  } else {
    await prisma.menuItem.create({
      data: {
        name,
        description,
        imageUrl,
        priceCents,
        categoryId,
        available,
      },
    });
  }

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  revalidatePath("/pos");
  redirect("/admin/menu");
}

export async function createCategory(formData: FormData) {
  await requireSession([...STAFF_ROLES]);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const count = await prisma.category.count();
  await prisma.category.create({ data: { name, sortOrder: count + 1 } });
  revalidatePath("/admin/menu");
}

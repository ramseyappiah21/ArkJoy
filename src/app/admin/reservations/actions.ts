"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/money";
import { requireSession } from "@/lib/session";

export async function updateReservationStatus(formData: FormData) {
  await requireSession([...STAFF_ROLES]);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["requested", "confirmed", "cancelled", "seated"].includes(status)) {
    return;
  }
  await prisma.reservation.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
}

export async function deleteReservation(formData: FormData) {
  await requireSession([...STAFF_ROLES]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.reservation.delete({ where: { id } });
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
}

"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function submitReservation(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const partySize = Number(formData.get("partySize") ?? 0);
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name || !email || !phone || !date || !time || partySize < 1) {
    redirect("/reserve?error=1");
  }

  await prisma.reservation.create({
    data: { name, email, phone, partySize, date, time, notes },
  });

  redirect("/reserve?ok=1");
}

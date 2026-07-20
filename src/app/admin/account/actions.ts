"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/money";
import { requireSession } from "@/lib/session";

export type ChangePasswordState = {
  ok?: boolean;
  error?: string;
};

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await requireSession([...STAFF_ROLES]);
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next || !confirm) {
    return { error: "Fill in all password fields." };
  }
  if (next.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (next !== confirm) {
    return { error: "New password and confirmation do not match." };
  }
  if (next === current) {
    return { error: "New password must be different from the current one." };
  }

  const email = session.user.email?.toLowerCase().trim();
  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return {
      error:
        "Account not found. Sign out and sign in again, then try once more.",
    };
  }

  const matches = await bcrypt.compare(current, user.passwordHash);
  if (!matches) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(next, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  revalidatePath("/admin/account");
  return { ok: true };
}

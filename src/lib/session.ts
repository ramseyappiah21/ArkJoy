import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/lib/types";

export async function requireSession(roles?: Role[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (roles && (!session.user.role || !roles.includes(session.user.role))) {
    redirect("/login?error=forbidden");
  }
  return session;
}

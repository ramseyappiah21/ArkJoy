import { AppShell } from "@/components/AppShell";
import { STAFF_ROLES } from "@/lib/money";
import { requireSession } from "@/lib/session";
import type { Role } from "@/lib/types";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/menu", label: "Menu photos" },
  { href: "/admin/account", label: "Account" },
];

const ROLE_LABEL: Record<Role, string> = {
  manager: "Staff",
  cashier: "Staff",
  kitchen: "Staff",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession([...STAFF_ROLES]);
  const role = session.user.role as Role;
  return (
    <AppShell
      brandHref="/admin"
      nav={NAV}
      userName={session.user.name ?? "Staff"}
      userRole={ROLE_LABEL[role] ?? "Staff"}
    >
      {children}
    </AppShell>
  );
}

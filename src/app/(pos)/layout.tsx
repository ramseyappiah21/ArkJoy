import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/session";

const NAV = [
  { href: "/pos", label: "Modes" },
  { href: "/pos/order", label: "Quick order" },
  { href: "/pos/tables", label: "Tables" },
  { href: "/pos/tickets", label: "Open checks" },
  { href: "/kitchen", label: "Kitchen" },
];

export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession(["cashier", "manager"]);
  return (
    <AppShell
      brandHref="/pos"
      variant="terminal"
      nav={
        session.user.role === "manager"
          ? [...NAV, { href: "/admin", label: "Back office" }]
          : NAV
      }
      userName={session.user.name ?? "Cashier"}
      userRole={session.user.role}
    >
      {children}
    </AppShell>
  );
}

import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/session";

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession(["kitchen", "manager", "cashier"]);
  const nav =
    session.user.role === "manager"
      ? [
          { href: "/kitchen", label: "KDS" },
          { href: "/pos", label: "Front of house" },
          { href: "/admin", label: "Back office" },
        ]
      : session.user.role === "cashier"
        ? [
            { href: "/kitchen", label: "KDS" },
            { href: "/pos", label: "Front of house" },
          ]
        : [{ href: "/kitchen", label: "KDS" }];

  return (
    <AppShell
      brandHref="/kitchen"
      variant="kds"
      nav={nav}
      userName={session.user.name ?? "Kitchen"}
      userRole={session.user.role}
    >
      {children}
    </AppShell>
  );
}

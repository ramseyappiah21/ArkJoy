import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { NavLinks } from "@/components/NavLinks";

type NavItem = { href: string; label: string };

export function AppShell({
  brandHref,
  nav,
  userName,
  userRole,
  children,
  variant = "default",
}: {
  brandHref: string;
  nav: NavItem[];
  userName: string;
  userRole: string;
  children: React.ReactNode;
  variant?: "default" | "terminal" | "kds";
}) {
  return (
    <div className={`app-shell shell-${variant}`}>
      <aside className="app-nav">
        <Link href={brandHref} className="brand">
          ArkJoy
          <small>Restaurant OS</small>
        </Link>
        <nav aria-label="Primary">
          <NavLinks items={nav} />
        </nav>
        <div className="nav-user">
          <strong>{userName}</strong>
          <span className="role-pill">{userRole}</span>
          <Link href="/admin/account" className="nav-account-link">
            Change password
          </Link>
          <SignOutButton />
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}

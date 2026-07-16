"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string, hrefs: string[]) {
  if (pathname === href) return true;
  if (!pathname.startsWith(href + "/")) return false;
  const longerMatch = hrefs.some(
    (h) =>
      h !== href &&
      h.length > href.length &&
      (pathname === h || pathname.startsWith(h + "/"))
  );
  return !longerMatch;
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const hrefs = items.map((i) => i.href);

  return (
    <>
      {items.map((item) => {
        const active = isActive(pathname, item.href, hrefs);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link"
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/story", label: "Our story" },
  { href: "/menu", label: "Menu" },
  { href: "/reserve", label: "Reserve" },
  { href: "/contact", label: "Contact" },
];

export function GuestNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`guest-nav${scrolled ? " is-solid" : ""}`}>
      <Link href="/" className="guest-logo">
        ArkJoy
      </Link>

      <button
        type="button"
        className="guest-menu-btn"
        aria-expanded={open}
        aria-controls="guest-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Menu</span>
        <span className="guest-menu-icon" aria-hidden="true" />
      </button>

      <nav
        id="guest-drawer"
        className={`guest-drawer${open ? " is-open" : ""}`}
        aria-label="Site"
      >
        <button
          type="button"
          className="guest-drawer-close"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
        <ul>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/login" className="guest-staff-link">
              Staff
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

import Link from "next/link";

export function GuestFooter() {
  return (
    <footer className="guest-footer">
      <div className="guest-footer-grid">
        <div>
          <p className="guest-footer-brand">ArkJoy</p>
          <p>
            A neighborhood table for unhurried meals, seasonal plates, and warm
            company.
          </p>
        </div>
        <div>
          <h2>Visit</h2>
          <p>
            Buoho, Kumasi
            <br />
            Afigya Kwabre District
            <br />
            Obuasi · AN524 Ivory Street
          </p>
          <p>
            Mon–Sat · 12:00–21:00
            <br />
            Sunday · Closed
          </p>
        </div>
        <div>
          <h2>Contact</h2>
          <p>
            <a href="mailto:ramseyappiah21@gmail.com">ramseyappiah21@gmail.com</a>
            <br />
            <a href="tel:+233546774063">+233 54 677 4063</a>
          </p>
          <p>
            <Link href="/reserve">Reserve a table</Link>
            <br />
            <Link href="/login">Staff sign in</Link>
          </p>
        </div>
      </div>
      <p className="guest-footer-copy">
        © {new Date().getFullYear()} ArkJoy Restaurant. All rights reserved.
      </p>
    </footer>
  );
}

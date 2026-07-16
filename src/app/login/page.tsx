"use client";

import { signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const params = useSearchParams();
  const urlError = params.get("error");
  const [error, setError] = useState<string | null>(() => {
    if (urlError === "CredentialsSignin") {
      return "Invalid email or password. Use password123, or tap a demo account below.";
    }
    if (urlError === "forbidden") {
      return "Please sign in with a staff account.";
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");

    await signOut({ redirect: false });

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res || res.error || res.ok === false) {
      setLoading(false);
      setError(
        "Invalid email or password. Use your staff email and password123, or tap a demo account below."
      );
      return;
    }

    window.location.assign("/admin");
  }

  function fillDemo(email: string) {
    const form = document.getElementById("staff-login") as HTMLFormElement | null;
    if (!form) return;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement;
    emailInput.value = email;
    passwordInput.value = "password123";
    setError(null);
  }

  return (
    <>
      <form id="staff-login" className="stack" onSubmit={onSubmit}>
        {error && (
          <p className="alert danger" role="alert">
            {error}
          </p>
        )}
        <label className="field">
          Email
          <input
            name="email"
            type="text"
            inputMode="email"
            autoComplete="off"
            required
            defaultValue="ramseyappiah21@gmail.com"
          />
        </label>
        <label className="field">
          Password
          <input
            name="password"
            type="password"
            autoComplete="off"
            required
            defaultValue="password123"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <aside className="demo-accounts">
        <strong>Staff accounts</strong> — same dashboard for everyone · password{" "}
        <code>password123</code>
        <ul className="demo-account-list">
          <li>
            <button
              type="button"
              className="secondary"
              onClick={() => fillDemo("ramseyappiah21@gmail.com")}
            >
              ramseyappiah21@gmail.com
            </button>
          </li>
          <li>
            <button
              type="button"
              className="secondary"
              onClick={() => fillDemo("cashier@arkjoy.local")}
            >
              cashier@arkjoy.local
            </button>
          </li>
          <li>
            <button
              type="button"
              className="secondary"
              onClick={() => fillDemo("kitchen@arkjoy.local")}
            >
              kitchen@arkjoy.local
            </button>
          </li>
        </ul>
      </aside>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <article className="login-card">
        <h1 className="brand-mark">ArkJoy</h1>
        <p>Staff sign-in for reservations and menu.</p>
        <Suspense fallback={<p>Loading…</p>}>
          <LoginForm />
        </Suspense>
      </article>
    </div>
  );
}

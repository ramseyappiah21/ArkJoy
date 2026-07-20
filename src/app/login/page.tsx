"use client";

import { PasswordInput } from "@/components/PasswordInput";
import { signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const params = useSearchParams();
  const urlError = params.get("error");
  const [error, setError] = useState<string | null>(() => {
    if (urlError === "CredentialsSignin") {
      return "Invalid email or password. Please try again.";
    }
    if (urlError === "forbidden") {
      return "You do not have permission to access that area.";
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
      setError("Invalid email or password. Please try again.");
      return;
    }

    window.location.assign("/admin");
  }

  return (
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
          type="email"
          autoComplete="username"
          required
          placeholder="you@example.com"
        />
      </label>
      <label className="field">
        Password
        <PasswordInput
          name="password"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="hint" style={{ marginTop: "0.5rem", textAlign: "center" }}>
        Staff only. Contact your manager if you need access.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <article className="login-card">
        <h1 className="brand-mark">ArkJoy</h1>
        <p>Staff sign-in for reservations and menu management.</p>
        <Suspense fallback={<p>Loading…</p>}>
          <LoginForm />
        </Suspense>
      </article>
    </div>
  );
}

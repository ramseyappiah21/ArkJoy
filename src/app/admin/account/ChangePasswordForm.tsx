"use client";

import { useActionState } from "react";
import {
  changePassword,
  type ChangePasswordState,
} from "@/app/admin/account/actions";
import { PasswordInput } from "@/components/PasswordInput";

const initial: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);

  return (
    <form className="stack" action={action} style={{ maxWidth: 420 }}>
      {state.error && (
        <p className="alert danger" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="alert ok" role="status">
          Password updated. Use your new password next time you sign in.
        </p>
      )}

      <label className="field">
        Current password
        <PasswordInput
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </label>
      <label className="field">
        New password
        <span className="hint">At least 8 characters</span>
        <PasswordInput
          name="newPassword"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </label>
      <label className="field">
        Confirm new password
        <PasswordInput
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}

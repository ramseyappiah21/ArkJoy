import { ChangePasswordForm } from "./ChangePasswordForm";

export default function AccountPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Account</h1>
          <p>Change the password for your staff login.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Change password</h2>
        <ChangePasswordForm />
      </section>
    </>
  );
}

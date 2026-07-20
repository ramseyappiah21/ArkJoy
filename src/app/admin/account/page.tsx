import { ChangePasswordForm } from "./ChangePasswordForm";
import { requireSession } from "@/lib/session";
import { STAFF_ROLES } from "@/lib/money";

export default async function AccountPage() {
  const session = await requireSession([...STAFF_ROLES]);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Account</h1>
          <p>
            Signed in as {session.user.email ?? session.user.name}. Change your
            staff login password below.
          </p>
        </div>
      </header>

      <section className="panel">
        <h2>Change password</h2>
        <ChangePasswordForm />
      </section>
    </>
  );
}

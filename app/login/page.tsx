import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "../auth/forms";
import { getAccount } from "../auth/supabase";

export const metadata = { title: "Logowanie · Domowa lista" };

export default async function LoginPage() {
  const { configured, email } = await getAccount();
  if (email) redirect("/");

  return (
    <main className="shell login-shell">
      <Link className="account-link" href="/">Wróć do listy zakupów</Link>
      <section className="list-card" aria-labelledby="login-title">
        <h1 id="login-title">Zaloguj się</h1>
        {configured ? <LoginForm /> : <p>Logowanie jest niedostępne.</p>}
      </section>
    </main>
  );
}

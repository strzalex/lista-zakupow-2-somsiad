import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "../auth/supabase";
import { NEIGHBOR_EMAIL } from "../products/data";

export const metadata = { title: "Dev mode · Domowa lista" };

export default async function UnderTheHoodPage() {
  const { client, email, userId } = await getAccount();
  if (!client || !userId) redirect("/login");
  if (email !== NEIGHBOR_EMAIL) redirect("/");

  // This deliberately omits the application's family filter to demonstrate RLS.
  const { data: products, error } = await client.from("products").select("*");

  return (
    <main className="shell demo-shell">
      <Link className="account-link" href="/">Wróć do listy zakupów</Link>
      <section className="list-card" aria-labelledby="demo-title">
        <span className="count">Sesja SOMSIADA</span>
        <h1 id="demo-title">Dev mode</h1>
        <p>Na stronie głównej Somsiad widzi swoją listę. Sprawdź, co zwraca Supabase, gdy jego konto pyta o produkty bez filtra rodziny.</p>
        <h2>Zapytanie z sesji Somsiada</h2>
        <pre className="demo-code"><code>{'supabase.from("products").select("*")'}</code></pre>
        <h2>Odpowiedź Supabase</h2>
        {error ? (
          <p className="auth-error" role="alert">Supabase odrzucił zapytanie ({error.code}).</p>
        ) : (
          <>
            {products.length > 0 ? (
              <p>Supabase zwrócił {products.length} poz. Somsiad widzi produkty z listy Ani i Bartka, bo RLS na tabeli produktów jest wyłączone.</p>
            ) : (
              <p>Supabase nie zwrócił żadnych produktów dostępnych dla tego konta.</p>
            )}
            <pre className="demo-code" tabIndex={0}><code>{JSON.stringify(products, null, 2)}</code></pre>
          </>
        )}
      </section>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { AccountMenu } from "./auth/forms";
import { getAccount } from "./auth/supabase";
import { findFamily, NEIGHBOR_EMAIL } from "./products/data";
import ShoppingList from "./shopping-list";

export default async function Home() {
  const { client, email, userId } = await getAccount();
  const isNeighbor = Boolean(userId && email === NEIGHBOR_EMAIL);
  let list = isNeighbor
    ? <ShoppingList key={userId} storageKey={`domowa-lista:zakupy:${userId}`} />
    : <ShoppingList key="local" />;

  if (client && userId && !isNeighbor) {
    const { data: membership, error } = await findFamily(client, userId);
    if (error) {
      list = <p className="list-card auth-error" role="alert">Nie udało się sprawdzić dostępu do listy.</p>;
    } else if (membership) {
      const { data: products, error: productsError } = await client.from("products")
        .select("id, name, bought")
        .eq("family_id", membership.family_id)
        .order("created_at")
        .order("id");

      list = productsError
        ? <p className="list-card auth-error" role="alert">Nie udało się wczytać listy rodziny.</p>
        : <ShoppingList key={userId} sharedItems={products} />;
    }
  }

  return (
    <div className="shell">
      <header className="masthead">
        <div className="wordmark">
          <Image src="/icon.svg" width={38} height={38} alt="" loading="eager" />
          Domowa lista
        </div>
        <div className="masthead-actions">
          {isNeighbor && (
            <Link className="account-link" href="/pod-maska" prefetch={false}>Dev mode</Link>
          )}
          {email ? <AccountMenu email={email} /> : (
            <Link className="account-link" href="/login">Zaloguj się</Link>
          )}
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <h1 id="page-title">Lista zakupów</h1>
            <p>Zapisz, czego potrzebujesz, i odhaczaj produkty w sklepie.</p>
          </div>
          <Image className="groceries" src="/groceries.svg" width={264} height={210} alt="" priority />
        </section>

        {list}
      </main>
    </div>
  );
}

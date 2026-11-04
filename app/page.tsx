import Image from "next/image";
import Link from "next/link";
import { AccountMenu } from "./auth/forms";
import { getAccount } from "./auth/supabase";
import ShoppingList from "./shopping-list";

export default async function Home() {
  const { email } = await getAccount();

  return (
    <div className="shell">
      <header className="masthead">
        <div className="wordmark">
          <Image src="/icon.svg" width={38} height={38} alt="" loading="eager" />
          Domowa lista
        </div>
        {email ? <AccountMenu email={email} /> : (
          <Link className="account-link" href="/login">Zaloguj się</Link>
        )}
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <h1 id="page-title">Lista zakupów</h1>
            <p>Zapisz, czego potrzebujesz, i odhaczaj produkty w sklepie.</p>
          </div>
          <Image className="groceries" src="/groceries.svg" width={264} height={210} alt="" priority />
        </section>

        <ShoppingList />
      </main>
    </div>
  );
}

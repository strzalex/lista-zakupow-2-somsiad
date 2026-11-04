# Domowa lista

Prosta lista zakupów w Next.js. Dodawaj produkty, odhaczaj kupione i usuwaj pozycje pojedynczo lub zbiorczo.

## Uruchomienie

Skopiuj `.env.example` do `.env.local` i wpisz adres projektu oraz klucz `publishable` z panelu Supabase. Logowanie korzysta z kont utworzonych w Supabase Auth.

```sh
npm ci
npm run dev
```

Otwórz [localhost:3000](http://localhost:3000).

Lista zapisuje się w `localStorage` przeglądarki. Czyszczenie danych witryny usuwa zapisane produkty. Inne przeglądarki i urządzenia mają własne listy.

Kompilację produkcyjną uruchomisz przez `npm run build`, a gotową aplikację przez `npm start`.

## Dodawanie kodem kreskowym

Wybierz **Dodaj kodem kreskowym**, wpisz lub wklej cyfry spod kodu i kliknij **Dodaj**. Aplikacja pobiera nazwę z [Open Food Facts](https://world.openfoodfacts.org/) i zapisuje ją na aktualnej liście.

W `.env.local` możesz podać `OPEN_FOOD_FACTS_CONTACT_EMAIL`, aby Open Food Facts mogło skontaktować się z operatorem aplikacji. Do testów ustaw `OPEN_FOOD_FACTS_STAGING=1`, aby korzystać ze środowiska testowego dostawcy.

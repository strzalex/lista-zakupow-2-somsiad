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

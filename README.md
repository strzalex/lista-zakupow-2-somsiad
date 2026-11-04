# Domowa lista · SOMSIAD

Wersja szkoleniowa rodzinnej listy zakupów. Ania i Bartek korzystają ze wspólnej listy w Supabase. Somsiad ma konto, ale nie należy do rodziny.

## Uruchomienie

W `.env.local` ustaw `SUPABASE_URL` i `SUPABASE_PUBLISHABLE_KEY` z osobnego projektu demonstracyjnego Supabase.

```sh
npm ci
npm run dev -- --port 3001
```

Otwórz [localhost:3001](http://localhost:3001). Konta demonstracyjne to `ania@local.pl`, `bartek@local.pl` i `somsiad@local.pl`. Hasła do przygotowanej bazy są w lokalnym pliku `.env.demo-accounts`.

## Podpowiedzi zakupowe AI

Ustaw `OPENAI_API_KEY` w `.env.local` i uruchom ponownie aplikację. Na wspólnej liście rodziny rozwiń **Podpowiedzi zakupowe AI**, wpisz np. „tacos dla 4 osób”, a potem dodaj wybrane składniki. Do OpenAI trafia opis posiłku. Domyślny model to `gpt-4o-mini`; możesz go zmienić przez `OPENAI_MODEL` na model obsługujący Structured Outputs.

## Pokaz na zajęciach

1. Zaloguj się jako Ania i dodaj produkt. Zaloguj się jako Bartek i sprawdź wspólną listę.
2. Zaloguj się jako Somsiad. Na stronie głównej zobaczysz jego listę zapisywaną w tej przeglądarce. Kliknij **Dev mode** w nagłówku, żeby zobaczyć rzeczywistą odpowiedź Supabase na zapytanie `select('*')` bez filtra rodziny, wykonane z sesji Somsiada. Przy wyłączonym RLS API pozwala zalogowanym kontom również zapisywać dane w tej tabeli, choć Dev mode daje tylko podgląd.
3. W SQL Editorze projektu demonstracyjnego włącz RLS i odśwież podgląd. Somsiad zobaczy `[]`, a Ania i Bartek nadal zobaczą wspólną listę.

   ```sql
   alter table public.products enable row level security;
   ```

4. Przed kolejnym pokazem przywróć celowo podatny stan.

   ```sql
   alter table public.products disable row level security;
   ```

## Odtworzenie bazy demonstracyjnej

W pustym projekcie Supabase wykonaj po kolei migracje z `supabase/migrations`. W Supabase Auth utwórz trzy powyższe konta z hasłami szkoleniowymi i włącz potwierdzenie e-maila dla każdego konta przy tworzeniu. Następnie uruchom `supabase/seed.sql` w SQL Editorze. Seed przypisuje do rodziny wyłącznie Anię i Bartka oraz dodaje fikcyjne produkty.

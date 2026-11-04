"use server";

const lookupError = "Nie udało się połączyć z Open Food Facts. Spróbuj ponownie lub wpisz nazwę produktu.";

type LookupResult = { name: string } | { error: string };

export async function lookupProductByBarcode(value: string): Promise<LookupResult> {
  const barcode = typeof value === "string" ? value.trim() : "";
  if (!/^\d{8,14}$/.test(barcode)) {
    return { error: "Wpisz kod kreskowy składający się z 8–14 cyfr." };
  }

  const staging = process.env.OPEN_FOOD_FACTS_STAGING === "1";
  const host = staging ? "world.openfoodfacts.net" : "world.openfoodfacts.org";
  const url = new URL(`https://${host}/api/v3.6/product/${barcode}.json`);
  url.searchParams.set("fields", "product_name_pl,product_name");

  const contact = process.env.OPEN_FOOD_FACTS_CONTACT_EMAIL?.trim();
  const headers = new Headers({
    Accept: "application/json",
    "User-Agent": contact ? `DomowaLista/1.0 (${contact})` : "DomowaLista/1.0",
  });
  if (staging) headers.set("Authorization", "Basic b2ZmOm9mZg=="); // Public staging credentials: off:off.

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 404) {
      return { error: "Nie znaleziono produktu o tym kodzie. Możesz wpisać jego nazwę ręcznie." };
    }
    if (response.status === 429) {
      return { error: "Limit wyszukiwań został osiągnięty. Spróbuj za chwilę lub wpisz nazwę produktu." };
    }
    if (!response.ok) return { error: lookupError };

    const data: { product?: { product_name_pl?: unknown; product_name?: unknown } } | null = await response.json();
    if (!data?.product) return { error: lookupError };

    for (const value of [data.product.product_name_pl, data.product.product_name]) {
      if (typeof value !== "string") continue;
      const name = value.replace(/\s+/g, " ").trim();
      if (name && name.length <= 120) return { name };
    }
    return { error: "Produkt nie ma nazwy, którą można dodać do listy. Wpisz ją ręcznie." };
  } catch {
    return { error: lookupError };
  }
}

"use server";

import { getAuthClient } from "../auth/supabase";
import { findFamily } from "../products/data";

type SuggestionResult = { items: string[] } | { error: string };

const providerError = "Nie udało się pobrać podpowiedzi AI. Spróbuj ponownie.";

export async function suggestGroceries(meal: string): Promise<SuggestionResult> {
  const description = typeof meal === "string" ? meal.trim() : "";
  if (!description || description.length > 400) {
    return { error: "Opisz posiłek w maksymalnie 400 znakach." };
  }

  const client = await getAuthClient();
  const { data: session } = (await client?.auth.getClaims()) ?? {};
  const userId = session?.claims.sub;
  if (!client || !userId) return { error: "Zaloguj się ponownie." };

  const { data: membership, error } = await findFamily(client, userId);
  if (error) return { error: "Nie udało się sprawdzić dostępu do listy." };
  if (!membership) return { error: "Podpowiedzi AI są dostępne dla członków rodziny." };

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { error: "Podpowiedzi AI nie są jeszcze skonfigurowane." };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        store: false,
        max_output_tokens: 900,
        instructions: [
          "Z opisu posiłku przygotuj po polsku listę zakupów (do 24 pozycji).",
          "Każda pozycja to jeden produkt w formacie „Nazwa — ilość”, do 120 znaków.",
          "Uwzględnij podaną liczbę porcji, preferencje i składniki, które użytkownik już ma.",
          "Jeśli nie podano liczby porcji, załóż dwie. Podaj praktyczne ilości.",
          "Nie dodawaj przepisu ani komentarzy. Jeśli opis nie dotyczy posiłku, zwróć pustą listę.",
        ].join(" "),
        input: description,
        text: {
          format: {
            type: "json_schema",
            name: "shopping_suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: { items: { type: "array", items: { type: "string" } } },
              required: ["items"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) return { error: providerError };

    const result = await response.json() as {
      status?: string;
      output?: { type: string; content?: { type: string; text?: string }[] }[];
    };
    const output = result.output
      ?.find((entry) => entry.type === "message")
      ?.content?.find((entry) => entry.type === "output_text")?.text;
    if (result.status !== "completed" || !output) return { error: providerError };

    const { items } = JSON.parse(output) as { items?: unknown };
    if (!Array.isArray(items) || items.some((item) => typeof item !== "string")) {
      return { error: providerError };
    }

    const names = items.map((item: string) => item.trim());
    if (names.some((name) => !name || name.length > 120)) return { error: providerError };
    return { items: [...new Set(names)].slice(0, 24) };
  } catch {
    return { error: providerError };
  }
}

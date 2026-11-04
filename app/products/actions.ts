"use server";

import { revalidatePath } from "next/cache";
import { getAuthClient } from "../auth/supabase";
import { findFamily } from "./data";

type ProductChange =
  | { type: "add"; name: string }
  | { type: "toggle"; id: string; bought: boolean }
  | { type: "remove"; id: string }
  | { type: "clear-bought" };

export async function changeProduct(change: ProductChange) {
  const client = await getAuthClient();
  if (!client) return "Połączenie z listą jest niedostępne.";

  const { data: session } = await client.auth.getClaims();
  if (!session?.claims.sub) return "Zaloguj się ponownie.";

  const { data: membership, error: membershipError } = await findFamily(client, session.claims.sub);
  if (membershipError) return "Nie udało się sprawdzić dostępu do listy.";
  if (!membership) return "To konto nie należy do rodziny.";

  const familyId = membership.family_id;
  const products = client.from("products");
  const writeError = "Nie udało się zapisać zmiany. Spróbuj ponownie.";

  switch (change?.type) {
    case "add": {
      const name = typeof change.name === "string" ? change.name.trim() : "";
      if (!name || name.length > 120) return "Podaj nazwę produktu do 120 znaków.";
      const { error } = await products.insert({ family_id: familyId, name });
      if (error) return writeError;
      break;
    }
    case "toggle": {
      if (typeof change.id !== "string" || typeof change.bought !== "boolean") return writeError;
      const { error } = await products.update({ bought: change.bought })
        .eq("family_id", familyId).eq("id", change.id);
      if (error) return writeError;
      break;
    }
    case "remove": {
      if (typeof change.id !== "string") return writeError;
      const { error } = await products.delete().eq("family_id", familyId).eq("id", change.id);
      if (error) return writeError;
      break;
    }
    case "clear-bought": {
      const { error } = await products.delete().eq("family_id", familyId).eq("bought", true);
      if (error) return writeError;
      break;
    }
    default:
      return writeError;
  }

  revalidatePath("/");
  return null;
}

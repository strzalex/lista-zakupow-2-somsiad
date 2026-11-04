"use server";

import { redirect } from "next/navigation";
import { getAuthClient } from "./supabase";

export async function signIn(_previousError: string | null, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return "Podaj adres e-mail i hasło.";
  }

  const client = await getAuthClient();
  if (!client) return "Logowanie jest niedostępne.";

  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error?.code === "invalid_credentials") return "Nieprawidłowy adres e-mail lub hasło.";
  if (error || !data.session) return "Nie udało się zalogować. Spróbuj ponownie.";

  redirect("/");
}

export async function signOut() {
  const client = await getAuthClient();
  if (!client) return "Wylogowanie jest niedostępne.";

  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) return "Nie udało się wylogować. Spróbuj ponownie.";

  redirect("/login");
}

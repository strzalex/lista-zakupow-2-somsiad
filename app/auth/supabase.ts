import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createAuthClient(cookieMethods: CookieMethodsServer) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  return createServerClient(url, key, {
    cookies: cookieMethods,
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production" },
  });
}

export async function getAuthClient() {
  const cookieStore = await cookies();

  return createAuthClient({
    getAll: () => cookieStore.getAll(),
    setAll(cookiesToSet) {
      for (const { name, value, options } of cookiesToSet) {
        cookieStore.set(name, value, options);
      }
    },
  });
}

export async function getAccount() {
  const cookieStore = await cookies();
  // Proxy refreshes the session before Server Components read it.
  const client = createAuthClient({ getAll: () => cookieStore.getAll(), setAll: () => {} });
  const { data } = (await client?.auth.getClaims()) ?? {};

  return { client, configured: client !== null, email: data?.claims.email, userId: data?.claims.sub };
}

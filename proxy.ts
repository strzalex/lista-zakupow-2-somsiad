import { NextResponse, type NextRequest } from "next/server";
import { createAuthClient } from "./app/auth/supabase";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const client = createAuthClient({
    getAll: () => request.cookies.getAll(),
    setAll(cookiesToSet, headers) {
      for (const { name, value } of cookiesToSet) request.cookies.set(name, value);

      const previousCookies = response.cookies.getAll();
      response = NextResponse.next({ request });
      for (const cookie of previousCookies) response.cookies.set(cookie);
      for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
    },
  });

  await client?.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/", "/login", "/pod-maska"] };

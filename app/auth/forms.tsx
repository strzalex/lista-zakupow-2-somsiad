"use client";

import { useActionState } from "react";
import { signIn, signOut } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(signIn, null);

  return (
    <form className="login-form" action={action}>
      <label htmlFor="email">Adres e-mail</label>
      <input id="email" name="email" type="email" autoComplete="username" required />
      <label htmlFor="password">Hasło</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="add-button" type="submit" disabled={pending}>
        {pending ? "Logowanie…" : "Zaloguj się"}
      </button>
    </form>
  );
}

export function AccountMenu({ email }: { email: string }) {
  const [error, action, pending] = useActionState(signOut, null);

  return (
    <form className="account-menu" action={action}>
      <span>{email}</span>
      <button className="account-link" type="submit" disabled={pending}>
        {pending ? "Wylogowywanie…" : "Wyloguj się"}
      </button>
      {error && <p className="auth-error" role="alert">{error}</p>}
    </form>
  );
}

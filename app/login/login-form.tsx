"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "Nao foi possivel entrar.");
      }

      router.push("/");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Erro inesperado ao entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Usuario
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2"
          placeholder="Ex: gustavo"
          autoComplete="username"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Senha
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2"
          autoComplete="current-password"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>

      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
    </form>
  );
}

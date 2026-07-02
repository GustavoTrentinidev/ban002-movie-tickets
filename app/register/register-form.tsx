"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role: isAdmin ? "ADMIN" : "DEFAULT" }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "Nao foi possivel criar a conta.");
      }

      router.push("/");
      router.refresh();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Erro inesperado ao criar a conta.");
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
          placeholder="Ex: maria"
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
          placeholder="Minimo 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-amber-900">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(event) => setIsAdmin(event.target.checked)}
            className="h-4 w-4 rounded border-amber-400"
          />
          Registrar como administrador
        </label>
        <p className="mt-1 text-xs text-amber-800">
          Este toggle existe apenas para fins de teste/avaliacao deste projeto academico e nao
          deveria existir em um sistema real (qualquer pessoa poderia se tornar administrador).
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </button>

      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
    </form>
  );
}

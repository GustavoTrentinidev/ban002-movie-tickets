import Link from "next/link";
import { AdminPanel } from "@/app/admin/admin-panel";

export const runtime = "nodejs";

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-700">Administracao</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Gerenciamento de cadastro</h1>
            <p className="mt-2 text-slate-600">Gerencie usuarios, filmes, sessoes, salas e assentos usando as rotas existentes.</p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            Voltar para catalogo
          </Link>
        </div>
      </header>

      <AdminPanel />
    </main>
  );
}

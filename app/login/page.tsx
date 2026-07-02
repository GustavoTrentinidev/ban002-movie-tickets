import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-700">Cinema Tickets</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-2 text-slate-600">Acesse sua conta para consultar sessoes e comprar ingressos.</p>

        <LoginForm />

        <p className="mt-6 text-sm text-slate-600">
          Ainda nao tem uma conta?{" "}
          <Link href="/register" className="font-medium text-indigo-700 hover:text-indigo-900">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}

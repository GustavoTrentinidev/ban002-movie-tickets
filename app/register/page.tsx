import Link from "next/link";
import { RegisterForm } from "@/app/register/register-form";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-700">Cinema Tickets</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Criar conta</h1>
        <p className="mt-2 text-slate-600">Cadastre-se para consultar sessoes e comprar ingressos.</p>

        <RegisterForm />

        <p className="mt-6 text-sm text-slate-600">
          Ja tem uma conta?{" "}
          <Link href="/login" className="font-medium text-indigo-700 hover:text-indigo-900">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}

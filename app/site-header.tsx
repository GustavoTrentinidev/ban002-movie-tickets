import Link from "next/link";
import { getSessionUser } from "@/core/application/auth/get-session-user";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";
import { LogoutButton } from "@/app/logout-button";

export async function SiteHeader() {
  const session = await getSessionUser();
  if (!session) {
    return null;
  }

  const user = await repositoryFactory.user().findById(session.userId);

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold text-white">
          Cinema Tickets
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {session.role === "ADMIN" ? (
            <>
              <Link href="/admin" className="text-slate-300 transition hover:text-white">
                Administracao
              </Link>
              <Link href="/reports" className="text-slate-300 transition hover:text-white">
                Relatorios
              </Link>
            </>
          ) : null}
          <span className="text-slate-400">{user?.username ?? "Usuario"}</span>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}

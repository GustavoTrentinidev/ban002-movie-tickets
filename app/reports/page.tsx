import Link from "next/link";
import { ListUsersUseCase } from "@/core/application/use-cases/crud/user/list-users-use-case";
import { ListMoviesBoughtByUserReportUseCase } from "@/core/application/use-cases/reports/list-movies-bought-by-user-report-use-case";
import { ListSessionOccupancyReportUseCase } from "@/core/application/use-cases/reports/list-session-occupancy-report-use-case";
import { ListUserPurchaseSummaryReportUseCase } from "@/core/application/use-cases/reports/list-user-purchase-summary-report-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

export const runtime = "nodejs";

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

type PageProps = {
  searchParams: Promise<{
    userId?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: PageProps) {
  const { userId: userIdParam } = await searchParams;

  const listUsersUseCase = new ListUsersUseCase(repositoryFactory.user());
  const listMoviesBoughtByUserReportUseCase = new ListMoviesBoughtByUserReportUseCase(repositoryFactory.report());
  const listSessionOccupancyReportUseCase = new ListSessionOccupancyReportUseCase(repositoryFactory.report());
  const listUserPurchaseSummaryReportUseCase = new ListUserPurchaseSummaryReportUseCase(repositoryFactory.report());

  const users = await listUsersUseCase.execute();
  const parsedUserId = Number(userIdParam);
  const selectedUserId =
    Number.isInteger(parsedUserId) && parsedUserId > 0
      ? parsedUserId
      : users.length > 0
        ? users[0].id
        : null;

  const [moviesBoughtByUser, sessionOccupancy, userPurchaseSummary] = await Promise.all([
    selectedUserId === null ? Promise.resolve([]) : listMoviesBoughtByUserReportUseCase.execute(selectedUserId),
    listSessionOccupancyReportUseCase.execute(),
    listUserPurchaseSummaryReportUseCase.execute(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-700">Relatorios</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Analises do sistema</h1>
            <p className="mt-2 text-slate-600">
              Relatorios com associacao entre tabelas para suporte da disciplina de banco de dados.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            Voltar para catalogo
          </Link>
        </div>
      </header>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Relatorio 1: Filmes comprados por usuario selecionado
          </h2>
          <p className="mt-2 text-sm text-slate-600">Tabelas: users, orders, tickets, session, movie.</p>

          <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex min-w-64 flex-col gap-1 text-sm text-slate-700">
              Usuario
              <select
                name="userId"
                defaultValue={selectedUserId === null ? "" : String(selectedUserId)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
                disabled={users.length === 0}
              >
                {users.length === 0 ? <option value="">Nenhum usuario cadastrado</option> : null}
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} (id {user.id})
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={users.length === 0}
            >
              Gerar relatorio
            </button>
          </form>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-2 py-2 font-medium">Filme</th>
                  <th className="px-2 py-2 font-medium">Ingressos comprados</th>
                  <th className="px-2 py-2 font-medium">Sessoes distintas</th>
                  <th className="px-2 py-2 font-medium">Ultima sessao comprada</th>
                </tr>
              </thead>
              <tbody>
                {moviesBoughtByUser.map((row) => (
                  <tr key={row.movieId} className="border-b border-slate-100">
                    <td className="px-2 py-2 text-slate-800">{row.movieName}</td>
                    <td className="px-2 py-2 text-slate-700">{row.ticketsBought}</td>
                    <td className="px-2 py-2 text-slate-700">{row.sessionsCount}</td>
                    <td className="px-2 py-2 text-slate-700">{formatDateTime(row.lastSessionTime)}</td>
                  </tr>
                ))}
                {moviesBoughtByUser.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-3 text-slate-600">
                      Nenhuma compra encontrada para o usuario selecionado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Relatorio 2: Ocupacao por sessao</h2>
          <p className="mt-2 text-sm text-slate-600">Tabelas: session, room, seat, movie, ticket.</p>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-2 py-2 font-medium">Sessao</th>
                  <th className="px-2 py-2 font-medium">Filme</th>
                  <th className="px-2 py-2 font-medium">Sala</th>
                  <th className="px-2 py-2 font-medium">Horario</th>
                  <th className="px-2 py-2 font-medium">Vendidos</th>
                  <th className="px-2 py-2 font-medium">Capacidade</th>
                  <th className="px-2 py-2 font-medium">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {sessionOccupancy.map((row) => (
                  <tr key={row.sessionId} className="border-b border-slate-100">
                    <td className="px-2 py-2 text-slate-700">{row.sessionId}</td>
                    <td className="px-2 py-2 text-slate-800">{row.movieName}</td>
                    <td className="px-2 py-2 text-slate-700">{row.roomNumber}</td>
                    <td className="px-2 py-2 text-slate-700">{formatDateTime(row.sessionTime)}</td>
                    <td className="px-2 py-2 text-slate-700">{row.soldTickets}</td>
                    <td className="px-2 py-2 text-slate-700">{row.seatsCapacity}</td>
                    <td className="px-2 py-2 text-slate-700">{formatPercent(row.occupancyRate)}</td>
                  </tr>
                ))}
                {sessionOccupancy.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-2 py-3 text-slate-600">
                      Nenhuma sessao cadastrada.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Relatorio 3: Resumo de compras por usuario</h2>
          <p className="mt-2 text-sm text-slate-600">Tabelas: users, orders, tickets, session, movie.</p>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-2 py-2 font-medium">Usuario</th>
                  <th className="px-2 py-2 font-medium">Pedidos</th>
                  <th className="px-2 py-2 font-medium">Ingressos</th>
                  <th className="px-2 py-2 font-medium">Filmes distintos</th>
                  <th className="px-2 py-2 font-medium">Ultima compra</th>
                </tr>
              </thead>
              <tbody>
                {userPurchaseSummary.map((row) => (
                  <tr key={row.userId} className="border-b border-slate-100">
                    <td className="px-2 py-2 text-slate-800">
                      {row.username} (id {row.userId})
                    </td>
                    <td className="px-2 py-2 text-slate-700">{row.ordersCount}</td>
                    <td className="px-2 py-2 text-slate-700">{row.ticketsCount}</td>
                    <td className="px-2 py-2 text-slate-700">{row.distinctMoviesCount}</td>
                    <td className="px-2 py-2 text-slate-700">{formatDateTime(row.lastPurchaseAt)}</td>
                  </tr>
                ))}
                {userPurchaseSummary.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-3 text-slate-600">
                      Nenhum usuario cadastrado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

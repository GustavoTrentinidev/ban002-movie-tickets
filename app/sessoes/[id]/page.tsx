import Link from "next/link";
import { notFound } from "next/navigation";
import { GetMovieByIdUseCase } from "@/core/application/use-cases/crud/movie/get-movie-by-id-use-case";
import { ListSessionSeatsUseCase } from "@/core/application/use-cases/crud/seat/list-session-seats-use-case";
import { ListUsersUseCase } from "@/core/application/use-cases/crud/user/list-users-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";
import { SeatPurchasePanel } from "@/app/sessoes/[id]/seat-purchase-panel";

function parseId(value: string): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SessionPage({ params }: PageProps) {
  const { id } = await params;
  const sessionId = parseId(id);
  if (sessionId === null) {
    notFound();
  }

  const session = await repositoryFactory.session().findById(sessionId);
  if (!session) {
    notFound();
  }

  const listSessionSeatsUseCase = new ListSessionSeatsUseCase(repositoryFactory.seat());
  const sessionSeatMap = await listSessionSeatsUseCase.execute(sessionId).catch(() => notFound());

  const getMovieByIdUseCase = new GetMovieByIdUseCase(repositoryFactory.movie());
  const movie = await getMovieByIdUseCase.execute(session.movieId).catch(() => notFound());

  const listUsersUseCase = new ListUsersUseCase(repositoryFactory.user());
  const users = await listUsersUseCase.execute();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/filmes/${session.movieId}`} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
        Voltar para secoes
      </Link>

      <header className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{movie.name}</h1>
        <p className="mt-2 text-slate-600">{formatDateTime(session.sessionTime)}</p>
        <p className="text-slate-600">Sala {sessionSeatMap.roomNumber}</p>
      </header>

      <SeatPurchasePanel
        sessionId={session.id}
        users={users.map((user) => ({ id: user.id, username: user.username }))}
        seats={sessionSeatMap.seats.map((seat) => ({
          id: seat.id,
          number: seat.number,
          isBlocked: seat.isBlocked,
        }))}
      />
    </main>
  );
}
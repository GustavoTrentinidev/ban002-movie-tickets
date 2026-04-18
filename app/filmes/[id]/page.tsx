import Link from "next/link";
import { notFound } from "next/navigation";
import { GetMovieByIdUseCase } from "@/core/application/use-cases/crud/movie/get-movie-by-id-use-case";
import { ListSessionsUseCase } from "@/core/application/use-cases/crud/session/list-sessions-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

export const dynamic = "force-dynamic";

function parseId(value: string): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  const movieId = parseId(id);
  if (movieId === null) {
    notFound();
  }

  const getMovieByIdUseCase = new GetMovieByIdUseCase(repositoryFactory.movie());
  const listSessionsUseCase = new ListSessionsUseCase(repositoryFactory.session());

  const movie = await getMovieByIdUseCase.execute(movieId).catch(() => notFound());
  const sessions = await listSessionsUseCase.execute({ movieId });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
        Voltar para filmes
      </Link>

      <header className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">{movie.name}</h1>
        <p className="mt-2 text-slate-600">Duracao: {movie.duration ? `${movie.duration} min` : "nao informada"}</p>
      </header>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-slate-900">Secoes disponiveis</h2>

        {sessions.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white/80 p-5 text-slate-600">
            Nenhuma secao cadastrada para este filme.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/sessoes/${session.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-indigo-300 hover:shadow"
                >
                  <span className="font-medium text-slate-900">{formatDateTime(session.sessionTime)}</span>
                  <span className="text-sm text-slate-600">Sala {session.roomId}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

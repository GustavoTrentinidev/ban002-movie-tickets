import Link from "next/link";
import { ListMoviesUseCase } from "@/core/application/use-cases/crud/movie/list-movies-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

function placeholderColor(movieId: number): string {
  const palette = ["#f97316", "#14b8a6", "#0ea5e9", "#e11d48", "#7c3aed", "#16a34a"];
  return palette[movieId % palette.length];
}

function formatReleaseDate(date: Date | null): string {
  if (!date) {
    return "Data de estreia indisponivel";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(date);
}

export default async function HomePage() {
  const listMoviesUseCase = new ListMoviesUseCase(repositoryFactory.movie());
  const movies = await listMoviesUseCase.execute();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-700">Catalogo</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Filmes em cartaz</h1>
        <p className="mt-2 text-slate-600">Selecione um filme para ver as secoes disponiveis.</p>
      </header>

      {movies.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-800">Nenhum filme cadastrado</h2>
          <p className="mt-2 text-slate-600">Cadastre filmes pela API para visualizar aqui.</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/filmes/${movie.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div
                className="h-40 w-full rounded-xl"
                style={{ backgroundColor: placeholderColor(movie.id) }}
                aria-hidden
              />

              <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
                {movie.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{formatReleaseDate(movie.releaseDate)}</p>
              <p className="mt-1 text-sm text-slate-600">
                Duracao: {movie.duration ? `${movie.duration} min` : "nao informada"}
              </p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
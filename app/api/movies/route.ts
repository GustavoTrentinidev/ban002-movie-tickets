import { MovieController } from "@/core/application/controllers/movie-controller";
import { CreateMovieUseCase } from "@/core/application/use-cases/crud/movie/create-movie-use-case";
import { DeleteMovieUseCase } from "@/core/application/use-cases/crud/movie/delete-movie-use-case";
import { GetMovieByIdUseCase } from "@/core/application/use-cases/crud/movie/get-movie-by-id-use-case";
import { ListMoviesUseCase } from "@/core/application/use-cases/crud/movie/list-movies-use-case";
import { UpdateMovieUseCase } from "@/core/application/use-cases/crud/movie/update-movie-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

export const runtime = "nodejs";

function buildMovieController(): MovieController {
  const repository = repositoryFactory.movie();
  const createMovieUseCase = new CreateMovieUseCase(repository);
  const listMoviesUseCase = new ListMoviesUseCase(repository);
  const getMovieByIdUseCase = new GetMovieByIdUseCase(repository);
  const updateMovieUseCase = new UpdateMovieUseCase(repository);
  const deleteMovieUseCase = new DeleteMovieUseCase(repository);

  return new MovieController(
    createMovieUseCase,
    listMoviesUseCase,
    getMovieByIdUseCase,
    updateMovieUseCase,
    deleteMovieUseCase
  );
}

export async function GET(): Promise<Response> {
  const controller = buildMovieController();
  return controller.list();
}

export async function POST(request: Request): Promise<Response> {
  const controller = buildMovieController();
  return controller.create(request);
}
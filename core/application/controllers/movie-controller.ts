import { AbstractController } from "@/core/application/controllers/abstract-controller";
import { CreateMovieUseCase } from "@/core/application/use-cases/crud/movie/create-movie-use-case";
import { DeleteMovieUseCase } from "@/core/application/use-cases/crud/movie/delete-movie-use-case";
import { GetMovieByIdUseCase } from "@/core/application/use-cases/crud/movie/get-movie-by-id-use-case";
import { ListMoviesUseCase } from "@/core/application/use-cases/crud/movie/list-movies-use-case";
import { UpdateMovieUseCase } from "@/core/application/use-cases/crud/movie/update-movie-use-case";
import { ApplicationError } from "@/core/application/errors/application-error";
import { requireRole } from "@/core/application/auth/get-session-user";

export class MovieController extends AbstractController {
  constructor(
    private readonly createMovieUseCase: CreateMovieUseCase,
    private readonly listMoviesUseCase: ListMoviesUseCase,
    private readonly getMovieByIdUseCase: GetMovieByIdUseCase,
    private readonly updateMovieUseCase: UpdateMovieUseCase,
    private readonly deleteMovieUseCase: DeleteMovieUseCase
  ) {
    super();
  }

  async create(request: Request): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const body = await request.json();
      const movie = await this.createMovieUseCase.execute({
        name: body?.name,
        duration: body?.duration,
        releaseDate: body?.releaseDate,
      });

      return Response.json(movie, { status: 201 });
    });
  }

  async list(): Promise<Response> {
    return this.execute(async () => {
      const movies = await this.listMoviesUseCase.execute();
      return Response.json(movies, { status: 200 });
    });
  }

  async getById(idParam: string): Promise<Response> {
    return this.execute(async () => {
      const id = this.parseId(idParam);
      const movie = await this.getMovieByIdUseCase.execute(id);
      return Response.json(movie, { status: 200 });
    });
  }

  async update(request: Request, idParam: string): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const id = this.parseId(idParam);
      const body = await request.json();
      const movie = await this.updateMovieUseCase.execute({
        id,
        name: body?.name,
        duration: body?.duration,
        releaseDate: body?.releaseDate,
      });

      return Response.json(movie, { status: 200 });
    });
  }

  async delete(idParam: string): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const id = this.parseId(idParam);
      await this.deleteMovieUseCase.execute(id);
      return new Response(null, { status: 204 });
    });
  }

  private parseId(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Invalid movie id.", 400);
    }

    return id;
  }
}
import { ApplicationError } from "@/core/application/errors/application-error";
import type { Movie } from "@/core/domain/entities/movie";
import type { MovieRepository } from "@/core/domain/repositories/movie-repository";

export class GetMovieByIdUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(id: number): Promise<Movie> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Invalid movie id.", 400);
    }

    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new ApplicationError("Movie not found.", 404);
    }

    return movie;
  }
}
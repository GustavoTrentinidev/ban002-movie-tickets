import { ApplicationError } from "@/core/application/errors/application-error";
import type { MovieRepository } from "@/core/domain/repositories/movie-repository";

export class DeleteMovieUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(id: number): Promise<void> {
    const deleted = await this.movieRepository.deleteById(id);
    if (!deleted) {
      throw new ApplicationError("Movie not found.", 404);
    }
  }
}

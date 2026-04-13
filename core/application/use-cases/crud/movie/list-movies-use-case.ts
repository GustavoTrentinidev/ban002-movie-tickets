import type { Movie } from "@/core/domain/entities/movie";
import type { MovieRepository } from "@/core/domain/repositories/movie-repository";

export class ListMoviesUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(): Promise<Movie[]> {
    return this.movieRepository.findAll();
  }
}

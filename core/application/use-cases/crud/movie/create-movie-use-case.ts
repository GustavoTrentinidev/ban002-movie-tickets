import { ApplicationError } from "@/core/application/errors/application-error";
import type { Movie } from "@/core/domain/entities/movie";
import type { MovieRepository } from "@/core/domain/repositories/movie-repository";

export interface CreateMovieInput {
  name: string;
  duration?: number | null;
  releaseDate?: string | Date | null;
}

export class CreateMovieUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(input: CreateMovieInput): Promise<Movie> {
    const name = input.name?.trim();
    if (!name) {
      throw new ApplicationError("Field 'name' is required.", 400);
    }

    const duration = this.normalizeDuration(input.duration);
    const releaseDate = this.normalizeReleaseDate(input.releaseDate);

    return this.movieRepository.create({
      name,
      duration,
      releaseDate,
    });
  }

  private normalizeDuration(duration?: number | null): number | null {
    if (duration === undefined || duration === null) {
      return null;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      throw new ApplicationError("Field 'duration' must be a positive integer.", 400);
    }

    return duration;
  }

  private normalizeReleaseDate(value?: string | Date | null): Date | null {
    if (value === undefined || value === null) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new ApplicationError("Field 'releaseDate' must be a valid date.", 400);
    }

    return parsed;
  }
}

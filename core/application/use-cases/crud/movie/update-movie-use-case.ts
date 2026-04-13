import { ApplicationError } from "@/core/application/errors/application-error";
import type { Movie } from "@/core/domain/entities/movie";
import type { MovieRepository } from "@/core/domain/repositories/movie-repository";

export interface UpdateMovieInput {
  id: number;
  name?: string | null;
  duration?: number | null;
  releaseDate?: string | Date | null;
}

export class UpdateMovieUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(input: UpdateMovieInput): Promise<Movie> {
    const movie = await this.movieRepository.findById(input.id);
    if (!movie) {
      throw new ApplicationError("Movie not found.", 404);
    }

    const hasName = input.name !== undefined;
    const hasDuration = input.duration !== undefined;
    const hasReleaseDate = input.releaseDate !== undefined;

    if (!hasName && !hasDuration && !hasReleaseDate) {
      throw new ApplicationError("At least one field must be provided to update.", 400);
    }

    const updated = await this.movieRepository.update({
      id: input.id,
      ...(hasName ? { name: this.normalizeName(input.name) } : {}),
      ...(hasDuration ? { duration: this.normalizeDuration(input.duration) } : {}),
      ...(hasReleaseDate ? { releaseDate: this.normalizeReleaseDate(input.releaseDate) } : {}),
    });

    if (!updated) {
      throw new ApplicationError("Movie not found.", 404);
    }

    return updated;
  }

  private normalizeName(name: string | null): string {
    if (name === null) {
      throw new ApplicationError("Field 'name' cannot be null.", 400);
    }

    const trimmed = name.trim();
    if (!trimmed) {
      throw new ApplicationError("Field 'name' is required.", 400);
    }

    return trimmed;
  }

  private normalizeDuration(duration: number | null): number | null {
    if (duration === null) {
      return null;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      throw new ApplicationError("Field 'duration' must be a positive integer.", 400);
    }

    return duration;
  }

  private normalizeReleaseDate(value: string | Date | null): Date | null {
    if (value === null) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new ApplicationError("Field 'releaseDate' must be a valid date.", 400);
    }

    return parsed;
  }
}

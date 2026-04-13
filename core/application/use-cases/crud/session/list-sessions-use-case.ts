import { ApplicationError } from "@/core/application/errors/application-error";
import type { Session } from "@/core/domain/entities/session";
import type { SessionRepository } from "@/core/domain/repositories/session-repository";

export interface ListSessionsInput {
  movieId?: number;
}

export class ListSessionsUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(input: ListSessionsInput = {}): Promise<Session[]> {
    if (input.movieId === undefined) {
      return this.sessionRepository.findAll();
    }

    const movieId = this.normalizePositiveInt(input.movieId, "movieId");
    const movieExists = await this.sessionRepository.movieExists(movieId);
    if (!movieExists) {
      throw new ApplicationError("Movie not found.", 404);
    }

    return this.sessionRepository.findByMovieId(movieId);
  }

  private normalizePositiveInt(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${field}' must be a positive integer.`, 400);
    }

    return value;
  }
}
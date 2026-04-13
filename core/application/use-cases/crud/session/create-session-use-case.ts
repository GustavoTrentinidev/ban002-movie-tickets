import { ApplicationError } from "@/core/application/errors/application-error";
import type { Session } from "@/core/domain/entities/session";
import type { SessionRepository } from "@/core/domain/repositories/session-repository";
import { ensureNoRoomSessionConflict } from "@/core/application/use-cases/crud/session/util/session-conflict-validator";

export interface CreateSessionUseCaseInput {
  movieId: number;
  roomId: number;
  sessionTime: string | Date;
}

export class CreateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(input: CreateSessionUseCaseInput): Promise<Session> {
    const movieId = this.normalizePositiveInt(input.movieId, "movieId");
    const roomId = this.normalizePositiveInt(input.roomId, "roomId");
    const sessionTime = this.normalizeDate(input.sessionTime, "sessionTime");

    const roomExists = await this.sessionRepository.roomExists(roomId);
    if (!roomExists) {
      throw new ApplicationError("Room not found.", 404);
    }

    const movieExists = await this.sessionRepository.movieExists(movieId);
    if (!movieExists) {
      throw new ApplicationError("Movie not found.", 404);
    }

    const movieDuration = await this.sessionRepository.findMovieDurationById(movieId);
    if (movieDuration === null || movieDuration <= 0) {
      throw new ApplicationError("Movie duration must be defined and greater than zero.", 400);
    }

    await ensureNoRoomSessionConflict({
      sessionRepository: this.sessionRepository,
      roomId,
      sessionTime,
      movieDurationInMinutes: movieDuration,
    });

    return this.sessionRepository.create({
      movieId,
      roomId,
      sessionTime,
    });
  }

  private normalizePositiveInt(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${field}' must be a positive integer.`, 400);
    }

    return value;
  }

  private normalizeDate(value: string | Date, field: string): Date {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new ApplicationError(`Field '${field}' must be a valid date.`, 400);
    }

    return parsed;
  }
}

import { ApplicationError } from "@/core/application/errors/application-error";
import type { Session } from "@/core/domain/entities/session";
import type { SessionRepository } from "@/core/domain/repositories/session-repository";
import { ensureNoRoomSessionConflict } from "@/core/application/use-cases/crud/session/util/session-conflict-validator";

export interface UpdateSessionUseCaseInput {
  id: number;
  movieId?: number;
  roomId?: number;
  sessionTime?: string | Date;
}

export class UpdateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(input: UpdateSessionUseCaseInput): Promise<Session> {
    const id = this.normalizePositiveInt(input.id, "id");
    const current = await this.sessionRepository.findById(id);
    if (!current) {
      throw new ApplicationError("Session not found.", 404);
    }

    if (input.movieId === undefined && input.roomId === undefined && input.sessionTime === undefined) {
      throw new ApplicationError("At least one field must be provided to update.", 400);
    }

    const movieId =
      input.movieId !== undefined
        ? this.normalizePositiveInt(input.movieId, "movieId")
        : current.movieId;
    const roomId =
      input.roomId !== undefined
        ? this.normalizePositiveInt(input.roomId, "roomId")
        : current.roomId;
    const sessionTime =
      input.sessionTime !== undefined
        ? this.normalizeDate(input.sessionTime, "sessionTime")
        : current.sessionTime;

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
      excludeSessionId: id,
    });

    return this.sessionRepository.update(id, {
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

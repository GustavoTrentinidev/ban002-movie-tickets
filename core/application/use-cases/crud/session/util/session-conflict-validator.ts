import { ApplicationError } from "@/core/application/errors/application-error";
import type { SessionRepository } from "@/core/domain/repositories/session-repository";

interface EnsureNoRoomSessionConflictInput {
  sessionRepository: SessionRepository;
  roomId: number;
  sessionTime: Date;
  movieDurationInMinutes: number;
  excludeSessionId?: number;
}

export async function ensureNoRoomSessionConflict(
  input: EnsureNoRoomSessionConflictInput
): Promise<void> {
  const roomSessions = await input.sessionRepository.findByRoomId(input.roomId);

  const conflict = roomSessions
    .filter((existingSession) =>
      input.excludeSessionId === undefined
        ? true
        : existingSession.id !== input.excludeSessionId
    )
    .some((existingSession) =>
      hasOverlap(
        input.sessionTime,
        input.movieDurationInMinutes,
        existingSession.sessionTime,
        existingSession.movieDuration
      )
    );

  if (conflict) {
    throw new ApplicationError("There is already a session in this room during this period.", 409);
  }
}

function hasOverlap(
  startA: Date,
  durationAInMinutes: number,
  startB: Date,
  durationBInMinutes: number | null
): boolean {
  if (durationBInMinutes === null || durationBInMinutes <= 0) {
    return true;
  }

  const endA = addMinutes(startA, durationAInMinutes);
  const endB = addMinutes(startB, durationBInMinutes);

  return startA < endB && startB < endA;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

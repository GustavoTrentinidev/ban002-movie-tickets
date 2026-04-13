import { ApplicationError } from "@/core/application/errors/application-error";
import type { SessionSeatMap } from "@/core/domain/repositories/seat-repository";
import type { SeatRepository } from "@/core/domain/repositories/seat-repository";

export class ListSessionSeatsUseCase {
  constructor(private readonly seatRepository: SeatRepository) {}

  async execute(sessionId: number): Promise<SessionSeatMap> {
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      throw new ApplicationError("Invalid session id.", 400);
    }

    const sessionSeatMap = await this.seatRepository.findSessionSeatMap(sessionId);
    if (!sessionSeatMap) {
      throw new ApplicationError("Session not found.", 404);
    }

    return sessionSeatMap;
  }
}
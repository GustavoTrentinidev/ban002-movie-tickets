import { ApplicationError } from "@/core/application/errors/application-error";
import type { Seat } from "@/core/domain/entities/seat";
import type { SeatRepository } from "@/core/domain/repositories/seat-repository";

export interface ListSeatsInput {
  roomId?: number;
}

export class ListSeatsUseCase {
  constructor(private readonly seatRepository: SeatRepository) {}

  async execute(input: ListSeatsInput = {}): Promise<Seat[]> {
    if (input.roomId === undefined) {
      return this.seatRepository.findAll();
    }

    const roomId = this.normalizePositiveInt(input.roomId, "roomId");
    const roomExists = await this.seatRepository.roomExists(roomId);
    if (!roomExists) {
      throw new ApplicationError("Room not found.", 404);
    }

    return this.seatRepository.findByRoomId(roomId);
  }

  private normalizePositiveInt(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${field}' must be a positive integer.`, 400);
    }

    return value;
  }
}

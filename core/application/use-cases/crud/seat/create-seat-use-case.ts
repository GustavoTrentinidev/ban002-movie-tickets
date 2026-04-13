import { ApplicationError } from "@/core/application/errors/application-error";
import type { Seat } from "@/core/domain/entities/seat";
import type { SeatRepository } from "@/core/domain/repositories/seat-repository";

export interface CreateSeatUseCaseInput {
  roomId: number;
  number: number;
}

export class CreateSeatUseCase {
  constructor(private readonly seatRepository: SeatRepository) {}

  async execute(input: CreateSeatUseCaseInput): Promise<Seat> {
    const roomId = this.normalizePositiveInt(input.roomId, "roomId");
    const number = this.normalizePositiveInt(input.number, "number");

    const roomExists = await this.seatRepository.roomExists(roomId);
    if (!roomExists) {
      throw new ApplicationError("Room not found.", 404);
    }

    const existingSeat = await this.seatRepository.findByRoomAndNumber(roomId, number);
    if (existingSeat) {
      throw new ApplicationError("Seat number already exists in this room.", 409);
    }

    return this.seatRepository.create({ roomId, number });
  }

  private normalizePositiveInt(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${field}' must be a positive integer.`, 400);
    }

    return value;
  }
}

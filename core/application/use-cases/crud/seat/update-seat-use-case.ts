import { ApplicationError } from "@/core/application/errors/application-error";
import type { Seat } from "@/core/domain/entities/seat";
import type { SeatRepository } from "@/core/domain/repositories/seat-repository";

export interface UpdateSeatUseCaseInput {
  id: number;
  roomId?: number;
  number?: number;
}

export class UpdateSeatUseCase {
  constructor(private readonly seatRepository: SeatRepository) {}

  async execute(input: UpdateSeatUseCaseInput): Promise<Seat> {
    const id = this.normalizePositiveInt(input.id, "id");
    const current = await this.seatRepository.findById(id);
    if (!current) {
      throw new ApplicationError("Seat not found.", 404);
    }

    const hasRoomId = input.roomId !== undefined;
    const hasNumber = input.number !== undefined;
    if (!hasRoomId && !hasNumber) {
      throw new ApplicationError("At least one field must be provided to update.", 400);
    }

    const roomId = hasRoomId ? this.normalizePositiveInt(input.roomId as number, "roomId") : current.roomId;
    const number = hasNumber ? this.normalizePositiveInt(input.number as number, "number") : current.number;

    const roomExists = await this.seatRepository.roomExists(roomId);
    if (!roomExists) {
      throw new ApplicationError("Room not found.", 404);
    }

    const seatWithSameNumber = await this.seatRepository.findByRoomAndNumber(roomId, number);
    if (seatWithSameNumber && seatWithSameNumber.id !== id) {
      throw new ApplicationError("Seat number already exists in this room.", 409);
    }

    return this.seatRepository.update(id, { roomId, number });
  }

  private normalizePositiveInt(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${field}' must be a positive integer.`, 400);
    }

    return value;
  }
}

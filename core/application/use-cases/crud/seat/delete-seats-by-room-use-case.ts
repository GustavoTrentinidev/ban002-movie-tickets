import { ApplicationError } from "@/core/application/errors/application-error";
import type { SeatRepository } from "@/core/domain/repositories/seat-repository";

export interface DeleteSeatsByRoomOutput {
  deletedCount: number;
}

export class DeleteSeatsByRoomUseCase {
  constructor(private readonly seatRepository: SeatRepository) {}

  async execute(roomId: number): Promise<DeleteSeatsByRoomOutput> {
    if (!Number.isInteger(roomId) || roomId <= 0) {
      throw new ApplicationError("Field 'roomId' must be a positive integer.", 400);
    }

    const roomExists = await this.seatRepository.roomExists(roomId);
    if (!roomExists) {
      throw new ApplicationError("Room not found.", 404);
    }

    const deletedCount = await this.seatRepository.deleteByRoomId(roomId);
    return { deletedCount };
  }
}

import { ApplicationError } from "@/core/application/errors/application-error";
import type { RoomRepository } from "@/core/domain/repositories/room-repository";

export class DeleteRoomUseCase {
  constructor(private readonly roomRepository: RoomRepository) {}

  async execute(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Field 'id' must be a positive integer.", 400);
    }

    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new ApplicationError("Room not found.", 404);
    }

    await this.roomRepository.deleteById(id);
  }
}

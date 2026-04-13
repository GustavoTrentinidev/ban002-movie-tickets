import { ApplicationError } from "@/core/application/errors/application-error";
import type { Room } from "@/core/domain/entities/room";
import type { RoomRepository } from "@/core/domain/repositories/room-repository";

export interface UpdateRoomInput {
  id: number;
  number: number;
}

export class UpdateRoomUseCase {
  constructor(private readonly roomRepository: RoomRepository) {}

  async execute(input: UpdateRoomInput): Promise<Room> {
    const id = this.normalizePositiveInt(input.id, "id");
    const number = this.normalizePositiveInt(input.number, "number");

    const currentRoom = await this.roomRepository.findById(id);
    if (!currentRoom) {
      throw new ApplicationError("Room not found.", 404);
    }

    const roomWithSameNumber = await this.roomRepository.findByNumber(number);
    if (roomWithSameNumber && roomWithSameNumber.id !== id) {
      throw new ApplicationError("Room number already exists.", 409);
    }

    return this.roomRepository.update(id, { number });
  }

  private normalizePositiveInt(value: number, fieldName: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${fieldName}' must be a positive integer.`, 400);
    }

    return value;
  }
}

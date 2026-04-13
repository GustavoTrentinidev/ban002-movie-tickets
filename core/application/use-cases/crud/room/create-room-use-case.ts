import { ApplicationError } from "@/core/application/errors/application-error";
import type { CreateRoomWithSeatsOutput, RoomRepository } from "@/core/domain/repositories/room-repository";

export interface CreateRoomInput {
  number: number;
  seatsCount: number;
}

export class CreateRoomUseCase {
  constructor(private readonly roomRepository: RoomRepository) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomWithSeatsOutput> {
    const number = this.normalizeRoomNumber(input.number);
    const seatsCount = this.normalizeSeatsCount(input.seatsCount);

    const existingRoom = await this.roomRepository.findByNumber(number);
    if (existingRoom) {
      throw new ApplicationError("Room number already exists.", 409);
    }

    return this.roomRepository.createWithSeats({
      number,
      seatsCount,
    });
  }

  private normalizeRoomNumber(value: number): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError("Field 'number' must be a positive integer.", 400);
    }

    return value;
  }

  private normalizeSeatsCount(value: number): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError("Field 'seatsCount' must be a positive integer.", 400);
    }

    return value;
  }
}

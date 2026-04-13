import type { Room } from "@/core/domain/entities/room";
import type { RoomRepository } from "@/core/domain/repositories/room-repository";

export class ListRoomsUseCase {
  constructor(private readonly roomRepository: RoomRepository) {}

  async execute(): Promise<Room[]> {
    return this.roomRepository.findAll();
  }
}

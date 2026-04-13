import type { Room } from "@/core/domain/entities/room";
import type { Seat } from "@/core/domain/entities/seat";

export interface CreateRoomWithSeatsInput {
  number: number;
  seatsCount: number;
}

export interface CreateRoomWithSeatsOutput {
  room: Room;
  seats: Seat[];
}

export interface RoomRepository {
  findByNumber(number: number): Promise<Room | null>;
  findById(id: number): Promise<Room | null>;
  findAll(): Promise<Room[]>;
  createWithSeats(input: CreateRoomWithSeatsInput): Promise<CreateRoomWithSeatsOutput>;
  update(id: number, input: UpdateRoomInput): Promise<Room>;
  deleteById(id: number): Promise<void>;
}

export interface UpdateRoomInput {
  number: number;
}

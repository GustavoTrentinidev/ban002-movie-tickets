import type { Room } from "@/core/domain/entities/room";
import type { Seat } from "@/core/domain/entities/seat";
import type {
  CreateRoomWithSeatsInput,
  CreateRoomWithSeatsOutput,
  RoomRepository,
  UpdateRoomInput,
} from "@/core/domain/repositories/room-repository";
import { prisma } from "@/core/infrastructure/database/prisma/client";

export class SQLRoomRepository implements RoomRepository {
  async findByNumber(number: number): Promise<Room | null> {
    const room = await prisma.room.findUnique({
      where: { number },
    });

    if (!room) {
      return null;
    }

    return this.toRoom(room);
  }

  async findById(id: number): Promise<Room | null> {
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return null;
    }

    return this.toRoom(room);
  }

  async findAll(): Promise<Room[]> {
    const rooms = await prisma.room.findMany({
      orderBy: { number: "asc" },
    });

    return rooms.map((room) => this.toRoom(room));
  }

  async createWithSeats(input: CreateRoomWithSeatsInput): Promise<CreateRoomWithSeatsOutput> {
    return prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          number: input.number,
        },
      });

      await tx.seat.createMany({
        data: Array.from({ length: input.seatsCount }, (_, index) => ({
          roomId: room.id,
          number: index + 1,
        })),
      });

      const seats = await tx.seat.findMany({
        where: { roomId: room.id },
        orderBy: { number: "asc" },
      });

      return {
        room: this.toRoom(room),
        seats: seats.map((seat) => this.toSeat(seat)),
      };
    });
  }

  async update(id: number, input: UpdateRoomInput): Promise<Room> {
    const room = await prisma.room.update({
      where: { id },
      data: {
        number: input.number,
      },
    });

    return this.toRoom(room);
  }

  async deleteById(id: number): Promise<void> {
    await prisma.room.delete({
      where: { id },
    });
  }

  private toRoom(room: { id: number; number: number }): Room {
    return {
      id: room.id,
      number: room.number,
    };
  }

  private toSeat(seat: { id: number; roomId: number; number: number }): Seat {
    return {
      id: seat.id,
      roomId: seat.roomId,
      number: seat.number,
    };
  }
}

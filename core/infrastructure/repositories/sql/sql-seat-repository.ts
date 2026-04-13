import type { Seat } from "@/core/domain/entities/seat";
import type {
  CreateSeatInput,
  SeatRepository,
  SessionSeatMap,
  UpdateSeatInput,
} from "@/core/domain/repositories/seat-repository";
import { prisma } from "@/core/infrastructure/database/prisma/client";

export class SQLSeatRepository implements SeatRepository {
  async roomExists(roomId: number): Promise<boolean> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    return Boolean(room);
  }

  async findById(id: number): Promise<Seat | null> {
    const seat = await prisma.seat.findUnique({
      where: { id },
    });

    if (!seat) {
      return null;
    }

    return this.toDomain(seat);
  }

  async findByRoomAndNumber(roomId: number, number: number): Promise<Seat | null> {
    const seat = await prisma.seat.findUnique({
      where: {
        roomId_number: {
          roomId,
          number,
        },
      },
    });

    if (!seat) {
      return null;
    }

    return this.toDomain(seat);
  }

  async findAll(): Promise<Seat[]> {
    const seats = await prisma.seat.findMany({
      orderBy: [{ roomId: "asc" }, { number: "asc" }],
    });

    return seats.map((seat) => this.toDomain(seat));
  }

  async findByRoomId(roomId: number): Promise<Seat[]> {
    const seats = await prisma.seat.findMany({
      where: { roomId },
      orderBy: { number: "asc" },
    });

    return seats.map((seat) => this.toDomain(seat));
  }

  async findSessionSeatMap(sessionId: number): Promise<SessionSeatMap | null> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        roomId: true,
        room: {
          select: {
            number: true,
            seats: {
              select: {
                id: true,
                roomId: true,
                number: true,
              },
              orderBy: { number: "asc" },
            },
          },
        },
        tickets: {
          select: {
            id: true,
            seatId: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    const ticketBySeatId = new Map<number, number>();
    session.tickets.forEach((ticket) => {
      ticketBySeatId.set(ticket.seatId, ticket.id);
    });

    return {
      sessionId: session.id,
      roomId: session.roomId,
      roomNumber: session.room.number,
      seats: session.room.seats.map((seat) => ({
        ...this.toDomain(seat),
        isBlocked: ticketBySeatId.has(seat.id),
        ticketId: ticketBySeatId.get(seat.id) ?? null,
      })),
    };
  }

  async create(input: CreateSeatInput): Promise<Seat> {
    const seat = await prisma.seat.create({
      data: {
        roomId: input.roomId,
        number: input.number,
      },
    });

    return this.toDomain(seat);
  }

  async update(id: number, input: UpdateSeatInput): Promise<Seat> {
    const seat = await prisma.seat.update({
      where: { id },
      data: {
        roomId: input.roomId,
        number: input.number,
      },
    });

    return this.toDomain(seat);
  }

  async deleteById(id: number): Promise<void> {
    await prisma.seat.delete({
      where: { id },
    });
  }

  async deleteByRoomId(roomId: number): Promise<number> {
    const result = await prisma.seat.deleteMany({
      where: { roomId },
    });

    return result.count;
  }

  private toDomain(seat: { id: number; roomId: number; number: number }): Seat {
    return {
      id: seat.id,
      roomId: seat.roomId,
      number: seat.number,
    };
  }
}
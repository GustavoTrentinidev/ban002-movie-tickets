import type { Seat } from "@/core/domain/entities/seat";

export interface SeatWithSessionStatus extends Seat {
  isBlocked: boolean;
  ticketId: number | null;
}

export interface SessionSeatMap {
  sessionId: number;
  roomId: number;
  roomNumber: number;
  seats: SeatWithSessionStatus[];
}

export interface CreateSeatInput {
  roomId: number;
  number: number;
}

export interface UpdateSeatInput {
  roomId?: number;
  number?: number;
}

export interface SeatRepository {
  roomExists(roomId: number): Promise<boolean>;
  findById(id: number): Promise<Seat | null>;
  findByRoomAndNumber(roomId: number, number: number): Promise<Seat | null>;
  findAll(): Promise<Seat[]>;
  findByRoomId(roomId: number): Promise<Seat[]>;
  findSessionSeatMap(sessionId: number): Promise<SessionSeatMap | null>;
  create(input: CreateSeatInput): Promise<Seat>;
  update(id: number, input: UpdateSeatInput): Promise<Seat>;
  deleteById(id: number): Promise<void>;
  deleteByRoomId(roomId: number): Promise<number>;
}
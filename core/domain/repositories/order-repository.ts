import type { Order } from "@/core/domain/entities/order";
import type { Ticket } from "@/core/domain/entities/ticket";

export interface SessionInfo {
  id: number;
  roomId: number;
}

export interface SeatInfo {
  id: number;
  roomId: number;
}

export interface OrderWithTickets {
  order: Order;
  tickets: Ticket[];
}

export interface CreateOrderWithTicketsInput {
  userId: number;
  status: number;
  sessionId: number;
  seatIds: number[];
}

export interface UpdateOrderInput {
  userId?: number;
  status?: number;
}

export interface OrderRepository {
  userExists(userId: number): Promise<boolean>;
  findSessionById(sessionId: number): Promise<SessionInfo | null>;
  findSeatsByIds(seatIds: number[]): Promise<SeatInfo[]>;
  hasAnyOccupiedSeat(sessionId: number, seatIds: number[]): Promise<boolean>;
  createWithTickets(input: CreateOrderWithTicketsInput): Promise<OrderWithTickets>;
  findAll(): Promise<OrderWithTickets[]>;
  findById(id: number): Promise<OrderWithTickets | null>;
  update(id: number, input: UpdateOrderInput): Promise<Order>;
  deleteById(id: number): Promise<void>;
}

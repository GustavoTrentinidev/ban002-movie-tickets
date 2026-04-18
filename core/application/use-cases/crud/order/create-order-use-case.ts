import { ApplicationError } from "@/core/application/errors/application-error";
import { Prisma } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";
import type { OrderWithTickets, OrderRepository } from "@/core/domain/repositories/order-repository";

export interface CreateOrderUseCaseInput {
  userId: number;
  status: number;
  sessionId: number;
  seatIds: number[];
}

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: CreateOrderUseCaseInput): Promise<OrderWithTickets> {
    const userId = this.normalizePositiveInt(input.userId, "userId");
    const status = this.normalizeStatus(input.status);
    const sessionId = this.normalizePositiveInt(input.sessionId, "sessionId");
    const seatIds = this.normalizeSeatIds(input.seatIds);

    const userExists = await this.orderRepository.userExists(userId);
    if (!userExists) {
      throw new ApplicationError("User not found.", 404);
    }

    const session = await this.orderRepository.findSessionById(sessionId);
    if (!session) {
      throw new ApplicationError("Session not found.", 404);
    }

    const seats = await this.orderRepository.findSeatsByIds(seatIds);
    if (seats.length !== seatIds.length) {
      throw new ApplicationError("One or more seats were not found.", 404);
    }

    const allSeatsBelongToSessionRoom = seats.every((seat) => seat.roomId === session.roomId);
    if (!allSeatsBelongToSessionRoom) {
      throw new ApplicationError("One or more seats do not belong to the session room.", 400);
    }

    const hasOccupiedSeat = await this.orderRepository.hasAnyOccupiedSeat(sessionId, seatIds);
    if (hasOccupiedSeat) {
      throw new ApplicationError("One or more seats are already occupied for this session.", 409);
    }

    try {
      return await this.orderRepository.createWithTickets({
        userId,
        status,
        sessionId,
        seatIds,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApplicationError("One or more seats are already occupied for this session.", 409);
      }

      throw error;
    }
  }

  private normalizePositiveInt(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${field}' must be a positive integer.`, 400);
    }

    return value;
  }

  private normalizeStatus(value: number): number {
    if (!Number.isInteger(value)) {
      throw new ApplicationError("Field 'status' must be an integer.", 400);
    }

    return value;
  }

  private normalizeSeatIds(value: number[]): number[] {
    if (!Array.isArray(value) || value.length === 0) {
      throw new ApplicationError("Field 'seatIds' must be a non-empty array.", 400);
    }

    const parsedIds = value.map((seatId) => this.normalizePositiveInt(seatId, "seatIds"));
    const uniqueIds = new Set(parsedIds);
    if (uniqueIds.size !== parsedIds.length) {
      throw new ApplicationError("Field 'seatIds' contains duplicated values.", 400);
    }

    return parsedIds;
  }
}

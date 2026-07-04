import type { Order } from "@/core/domain/entities/order";
import type { Ticket } from "@/core/domain/entities/ticket";
import type {
  CreateOrderWithTicketsInput,
  OrderRepository,
  OrderWithTickets,
  SeatInfo,
  SessionInfo,
  UpdateOrderInput,
} from "@/core/domain/repositories/order-repository";
import { getNextSequence } from "@/core/infrastructure/repositories/nosql/id-generator";
import { prisma } from "@/core/infrastructure/database/prisma/client";

export class NoSQLOrderRepository implements OrderRepository {
  async userExists(userId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return Boolean(user);
  }

  async findSessionById(sessionId: number): Promise<SessionInfo | null> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        roomId: true,
      },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      roomId: session.roomId,
    };
  }

  async findSeatsByIds(seatIds: number[]): Promise<SeatInfo[]> {
    if (seatIds.length === 0) {
      return [];
    }

    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds },
      },
      select: {
        id: true,
        roomId: true,
      },
    });

    return seats.map((seat) => ({
      id: seat.id,
      roomId: seat.roomId,
    }));
  }

  async hasAnyOccupiedSeat(sessionId: number, seatIds: number[]): Promise<boolean> {
    if (seatIds.length === 0) {
      return false;
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        sessionId,
        seatId: { in: seatIds },
      },
      select: {
        id: true,
      },
    });

    return Boolean(ticket);
  }

  async createWithTickets(input: CreateOrderWithTicketsInput): Promise<OrderWithTickets> {
    return prisma.$transaction(async (tx) => {
      const orderId = await getNextSequence(tx, "order");

      const order = await tx.order.create({
        data: {
          id: orderId,
          userId: input.userId,
          status: input.status,
        },
      });

      const tickets = [];
      for (const seatId of input.seatIds) {
        const ticketId = await getNextSequence(tx, "ticket");
        const ticket = await tx.ticket.create({
          data: {
            id: ticketId,
            orderId: order.id,
            sessionId: input.sessionId,
            seatId,
          },
        });
        tickets.push(ticket);
      }

      return {
        order: this.toOrder(order),
        tickets: tickets.map((ticket) => this.toTicket(ticket)),
      };
    });
  }

  async findAll(): Promise<OrderWithTickets[]> {
    const orders = await prisma.order.findMany({
      include: {
        tickets: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    return orders.map((order) => ({
      order: this.toOrder(order),
      tickets: order.tickets.map((ticket) => this.toTicket(ticket)),
    }));
  }

  async findById(id: number): Promise<OrderWithTickets | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        tickets: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!order) {
      return null;
    }

    return {
      order: this.toOrder(order),
      tickets: order.tickets.map((ticket) => this.toTicket(ticket)),
    };
  }

  async update(id: number, input: UpdateOrderInput): Promise<Order> {
    const order = await prisma.order.update({
      where: { id },
      data: {
        userId: input.userId,
        status: input.status,
      },
    });

    return this.toOrder(order);
  }

  async deleteById(id: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.ticket.deleteMany({
        where: { orderId: id },
      });

      await tx.order.delete({
        where: { id },
      });
    });
  }

  private toOrder(order: {
    id: number;
    userId: number;
    status: number;
    createdAt: Date;
  }): Order {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      createdAt: order.createdAt,
    };
  }

  private toTicket(ticket: {
    id: number;
    orderId: number;
    sessionId: number;
    seatId: number;
    createdAt: Date;
  }): Ticket {
    return {
      id: ticket.id,
      orderId: ticket.orderId,
      sessionId: ticket.sessionId,
      seatId: ticket.seatId,
      createdAt: ticket.createdAt,
    };
  }
}

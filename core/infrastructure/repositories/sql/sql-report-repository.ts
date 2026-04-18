import type {
  ReportRepository,
  SessionOccupancyReportRow,
  UserMovieTicketsReportRow,
  UserPurchaseSummaryReportRow,
} from "@/core/domain/repositories/report-repository";
import { prisma } from "@/core/infrastructure/database/prisma/client";

export class SQLReportRepository implements ReportRepository {
  async listMoviesBoughtByUser(userId: number): Promise<UserMovieTicketsReportRow[]> {
    const tickets = await prisma.ticket.findMany({
      where: {
        order: {
          userId,
        },
      },
      select: {
        session: {
          select: {
            id: true,
            movieId: true,
            sessionTime: true,
            movie: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const byMovie = new Map<number, UserMovieTicketsReportRow>();
    const sessionsByMovie = new Map<number, Set<number>>();
    for (const ticket of tickets) {
      const movieId = ticket.session.movieId;
      const movieSessions = sessionsByMovie.get(movieId) ?? new Set<number>();
      movieSessions.add(ticket.session.id);
      sessionsByMovie.set(movieId, movieSessions);

      const existing = byMovie.get(movieId);
      if (!existing) {
        byMovie.set(movieId, {
          movieId,
          movieName: ticket.session.movie.name,
          ticketsBought: 1,
          sessionsCount: 1,
          lastSessionTime: ticket.session.sessionTime,
        });
        continue;
      }

      existing.ticketsBought += 1;
      const currentLast = existing.lastSessionTime;
      if (!currentLast || ticket.session.sessionTime > currentLast) {
        existing.lastSessionTime = ticket.session.sessionTime;
      }
    }

    return [...byMovie.values()]
      .map((row) => ({
        ...row,
        sessionsCount: sessionsByMovie.get(row.movieId)?.size ?? row.sessionsCount,
      }))
      .sort((a, b) => b.ticketsBought - a.ticketsBought || a.movieName.localeCompare(b.movieName));
  }

  async listSessionOccupancy(): Promise<SessionOccupancyReportRow[]> {
    const sessions = await prisma.session.findMany({
      select: {
        id: true,
        sessionTime: true,
        movie: {
          select: {
            name: true,
          },
        },
        room: {
          select: {
            number: true,
            _count: {
              select: {
                seats: true,
              },
            },
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        sessionTime: "asc",
      },
    });

    return sessions.map((session) => {
      const seatsCapacity = session.room._count.seats;
      const soldTickets = session._count.tickets;
      const occupancyRate = seatsCapacity === 0 ? 0 : Number(((soldTickets / seatsCapacity) * 100).toFixed(2));

      return {
        sessionId: session.id,
        movieName: session.movie.name,
        roomNumber: session.room.number,
        sessionTime: session.sessionTime,
        seatsCapacity,
        soldTickets,
        occupancyRate,
      };
    });
  }

  async listUserPurchaseSummary(): Promise<UserPurchaseSummaryReportRow[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        orders: {
          select: {
            createdAt: true,
            tickets: {
              select: {
                session: {
                  select: {
                    movieId: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return users.map((user) => {
      let ticketsCount = 0;
      let lastPurchaseAt: Date | null = null;
      const distinctMovies = new Set<number>();

      for (const order of user.orders) {
        if (!lastPurchaseAt || order.createdAt > lastPurchaseAt) {
          lastPurchaseAt = order.createdAt;
        }

        ticketsCount += order.tickets.length;
        for (const ticket of order.tickets) {
          distinctMovies.add(ticket.session.movieId);
        }
      }

      return {
        userId: user.id,
        username: user.username,
        ordersCount: user.orders.length,
        ticketsCount,
        distinctMoviesCount: distinctMovies.size,
        lastPurchaseAt,
      };
    });
  }
}

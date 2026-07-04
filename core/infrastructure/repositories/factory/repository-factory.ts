import type { MovieRepository } from "@/core/domain/repositories/movie-repository";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";
import type { RoomRepository } from "@/core/domain/repositories/room-repository";
import type { ReportRepository } from "@/core/domain/repositories/report-repository";
import type { SeatRepository } from "@/core/domain/repositories/seat-repository";
import type { SessionRepository } from "@/core/domain/repositories/session-repository";
import type { UserRepository } from "@/core/domain/repositories/user-repository";
import { NoSQLMovieRepository } from "@/core/infrastructure/repositories/nosql/nosql-movie-repository";
import { NoSQLOrderRepository } from "@/core/infrastructure/repositories/nosql/nosql-order-repository";
import { NoSQLReportRepository } from "@/core/infrastructure/repositories/nosql/nosql-report-repository";
import { NoSQLRoomRepository } from "@/core/infrastructure/repositories/nosql/nosql-room-repository";
import { NoSQLSeatRepository } from "@/core/infrastructure/repositories/nosql/nosql-seat-repository";
import { NoSQLSessionRepository } from "@/core/infrastructure/repositories/nosql/nosql-session-repository";
import { NoSQLUserRepository } from "@/core/infrastructure/repositories/nosql/nosql-user-repository";

export interface RepositoryFactory {
  movie(): MovieRepository;
  session(): SessionRepository;
  seat(): SeatRepository;
  order(): OrderRepository;
  user(): UserRepository;
  room(): RoomRepository;
  report(): ReportRepository;
}

class NoSQLRepositoryFactory implements RepositoryFactory {
  movie(): MovieRepository {
    return new NoSQLMovieRepository();
  }

  session(): SessionRepository {
    return new NoSQLSessionRepository();
  }

  seat(): SeatRepository {
    return new NoSQLSeatRepository();
  }

  order(): OrderRepository {
    return new NoSQLOrderRepository();
  }

  user(): UserRepository {
    return new NoSQLUserRepository();
  }

  room(): RoomRepository {
    return new NoSQLRoomRepository();
  }

  report(): ReportRepository {
    return new NoSQLReportRepository();
  }
}

export const repositoryFactory: RepositoryFactory = new NoSQLRepositoryFactory();

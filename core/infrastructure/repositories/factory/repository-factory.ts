import type { MovieRepository } from "@/core/domain/repositories/movie-repository";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";
import type { RoomRepository } from "@/core/domain/repositories/room-repository";
import type { ReportRepository } from "@/core/domain/repositories/report-repository";
import type { SeatRepository } from "@/core/domain/repositories/seat-repository";
import type { SessionRepository } from "@/core/domain/repositories/session-repository";
import type { UserRepository } from "@/core/domain/repositories/user-repository";
import { SQLMovieRepository } from "@/core/infrastructure/repositories/sql/sql-movie-repository";
import { SQLOrderRepository } from "@/core/infrastructure/repositories/sql/sql-order-repository";
import { SQLReportRepository } from "@/core/infrastructure/repositories/sql/sql-report-repository";
import { SQLRoomRepository } from "@/core/infrastructure/repositories/sql/sql-room-repository";
import { SQLSeatRepository } from "@/core/infrastructure/repositories/sql/sql-seat-repository";
import { SQLSessionRepository } from "@/core/infrastructure/repositories/sql/sql-session-repository";
import { SQLUserRepository } from "@/core/infrastructure/repositories/sql/sql-user-repository";

export interface RepositoryFactory {
  movie(): MovieRepository;
  session(): SessionRepository;
  seat(): SeatRepository;
  order(): OrderRepository;
  user(): UserRepository;
  room(): RoomRepository;
  report(): ReportRepository;
}

class SQLRepositoryFactory implements RepositoryFactory {
  movie(): MovieRepository {
    return new SQLMovieRepository();
  }

  session(): SessionRepository {
    return new SQLSessionRepository();
  }

  seat(): SeatRepository {
    return new SQLSeatRepository();
  }

  order(): OrderRepository {
    return new SQLOrderRepository();
  }

  user(): UserRepository {
    return new SQLUserRepository();
  }

  room(): RoomRepository {
    return new SQLRoomRepository();
  }

  report(): ReportRepository {
    return new SQLReportRepository();
  }
}

export const repositoryFactory: RepositoryFactory = new SQLRepositoryFactory();

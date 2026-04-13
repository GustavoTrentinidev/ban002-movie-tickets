import type { Session } from "@/core/domain/entities/session";

export interface SessionWithMovieDuration extends Session {
  movieDuration: number | null;
}

export interface CreateSessionInput {
  movieId: number;
  roomId: number;
  sessionTime: Date;
}

export interface UpdateSessionInput {
  movieId?: number;
  roomId?: number;
  sessionTime?: Date;
}

export interface SessionRepository {
  roomExists(roomId: number): Promise<boolean>;
  movieExists(movieId: number): Promise<boolean>;
  findMovieDurationById(movieId: number): Promise<number | null>;
  findById(id: number): Promise<Session | null>;
  findAll(): Promise<Session[]>;
  findByMovieId(movieId: number): Promise<Session[]>;
  findByRoomId(roomId: number): Promise<SessionWithMovieDuration[]>;
  create(input: CreateSessionInput): Promise<Session>;
  update(id: number, input: UpdateSessionInput): Promise<Session>;
  deleteById(id: number): Promise<void>;
}
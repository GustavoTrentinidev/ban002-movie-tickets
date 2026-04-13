import type { Session } from "@/core/domain/entities/session";
import type {
  CreateSessionInput,
  SessionRepository,
  SessionWithMovieDuration,
  UpdateSessionInput,
} from "@/core/domain/repositories/session-repository";
import { prisma } from "@/core/infrastructure/database/prisma/client";

export class SQLSessionRepository implements SessionRepository {
  async roomExists(roomId: number): Promise<boolean> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    return Boolean(room);
  }

  async movieExists(movieId: number): Promise<boolean> {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { id: true },
    });

    return Boolean(movie);
  }

  async findMovieDurationById(movieId: number): Promise<number | null> {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { duration: true },
    });

    return movie?.duration ?? null;
  }

  async findById(id: number): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return null;
    }

    return this.toSession(session);
  }

  async findAll(): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      orderBy: { sessionTime: "asc" },
    });

    return sessions.map((session) => this.toSession(session));
  }

  async findByMovieId(movieId: number): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      where: { movieId },
      orderBy: { sessionTime: "asc" },
    });

    return sessions.map((session) => this.toSession(session));
  }

  async findByRoomId(roomId: number): Promise<SessionWithMovieDuration[]> {
    const sessions = await prisma.session.findMany({
      where: { roomId },
      include: {
        movie: {
          select: {
            duration: true,
          },
        },
      },
      orderBy: { sessionTime: "asc" },
    });

    return sessions.map((session) => ({
      ...this.toSession(session),
      movieDuration: session.movie.duration,
    }));
  }

  async create(input: CreateSessionInput): Promise<Session> {
    const session = await prisma.session.create({
      data: {
        movieId: input.movieId,
        roomId: input.roomId,
        sessionTime: input.sessionTime,
      },
    });

    return this.toSession(session);
  }

  async update(id: number, input: UpdateSessionInput): Promise<Session> {
    const session = await prisma.session.update({
      where: { id },
      data: {
        movieId: input.movieId,
        roomId: input.roomId,
        sessionTime: input.sessionTime,
      },
    });

    return this.toSession(session);
  }

  async deleteById(id: number): Promise<void> {
    await prisma.session.delete({
      where: { id },
    });
  }

  private toSession(session: {
    id: number;
    movieId: number;
    roomId: number;
    sessionTime: Date;
  }): Session {
    return {
      id: session.id,
      movieId: session.movieId,
      roomId: session.roomId,
      sessionTime: session.sessionTime,
    };
  }
}
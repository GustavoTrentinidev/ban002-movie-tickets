import type { Movie } from "@/core/domain/entities/movie";
import type {
  CreateMovieRepositoryInput,
  MovieRepository,
  UpdateMovieRepositoryInput,
} from "@/core/domain/repositories/movie-repository";
import { getNextSequence } from "@/core/infrastructure/repositories/nosql/id-generator";
import { prisma } from "@/core/infrastructure/database/prisma/client";

export class NoSQLMovieRepository implements MovieRepository {
  async create(input: CreateMovieRepositoryInput): Promise<Movie> {
    const movie = await prisma.$transaction(async (tx) => {
      const id = await getNextSequence(tx, "movie");

      return tx.movie.create({
        data: {
          id,
          name: input.name,
          duration: input.duration,
          releaseDate: input.releaseDate,
        },
      });
    });

    return this.toDomain(movie);
  }

  async findAll(): Promise<Movie[]> {
    const movies = await prisma.movie.findMany({
      orderBy: { id: "asc" },
    });

    return movies.map((movie: {
      id: number;
      name: string;
      duration: number | null;
      releaseDate: Date | null;
    }) => this.toDomain(movie));
  }

  async findById(id: number): Promise<Movie | null> {
    const movie = await prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      return null;
    }

    return this.toDomain(movie);
  }

  async update(input: UpdateMovieRepositoryInput): Promise<Movie | null> {
    const updatedCount = await prisma.movie.updateMany({
      where: { id: input.id },
      data: {
        name: input.name,
        duration: input.duration,
        releaseDate: input.releaseDate,
      },
    });

    if (updatedCount.count === 0) {
      return null;
    }

    const updated = await prisma.movie.findUnique({
      where: { id: input.id },
    });

    if (!updated) {
      return null;
    }

    return this.toDomain(updated);
  }

  async deleteById(id: number): Promise<boolean> {
    const deleted = await prisma.movie.deleteMany({
      where: { id },
    });

    return deleted.count > 0;
  }

  private toDomain(movie: {
    id: number;
    name: string;
    duration: number | null;
    releaseDate: Date | null;
  }): Movie {
    return {
      id: movie.id,
      name: movie.name,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
    };
  }
}

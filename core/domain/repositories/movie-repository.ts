import type { Movie } from "@/core/domain/entities/movie";

export interface CreateMovieRepositoryInput {
  name: string;
  duration: number | null;
  releaseDate: Date | null;
}

export interface MovieRepository {
  create(input: CreateMovieRepositoryInput): Promise<Movie>;
  findAll(): Promise<Movie[]>;
  findById(id: number): Promise<Movie | null>;
  update(input: UpdateMovieRepositoryInput): Promise<Movie | null>;
  deleteById(id: number): Promise<boolean>;
}

export interface UpdateMovieRepositoryInput {
  id: number;
  name?: string;
  duration?: number | null;
  releaseDate?: Date | null;
}

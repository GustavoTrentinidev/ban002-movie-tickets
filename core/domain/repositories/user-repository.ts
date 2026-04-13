import type { User } from "@/core/domain/entities/user";

export interface CreateUserInput {
  username: string;
}

export interface UpdateUserInput {
  username?: string;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  update(id: number, input: UpdateUserInput): Promise<User>;
  deleteById(id: number): Promise<void>;
}

import type { User, UserRole } from "@/core/domain/entities/user";

export interface CreateUserInput {
  username: string;
  passwordHash: string;
  role: UserRole;
}

export interface UpdateUserInput {
  username?: string;
  passwordHash?: string;
  role?: UserRole;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(id: number, input: UpdateUserInput): Promise<User>;
  deleteById(id: number): Promise<void>;
}

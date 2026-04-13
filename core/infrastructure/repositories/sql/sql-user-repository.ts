import type { User } from "@/core/domain/entities/user";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserRepository,
} from "@/core/domain/repositories/user-repository";
import { prisma } from "@/core/infrastructure/database/prisma/client";

export class SQLUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        username: input.username,
      },
    });

    return this.toUser(user);
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });

    return users.map((user) => this.toUser(user));
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.toUser(user);
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        username: input.username,
      },
    });

    return this.toUser(user);
  }

  async deleteById(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  private toUser(user: { id: number; username: string; createdAt: Date }): User {
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}

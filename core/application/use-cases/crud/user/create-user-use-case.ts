import { ApplicationError } from "@/core/application/errors/application-error";
import type { User } from "@/core/domain/entities/user";
import type { UserRepository } from "@/core/domain/repositories/user-repository";

export interface CreateUserUseCaseInput {
  username: string;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserUseCaseInput): Promise<User> {
    const username = this.normalizeUsername(input.username);

    return this.userRepository.create({
      username,
    });
  }

  private normalizeUsername(value: string): string {
    const username = value?.trim();
    if (!username) {
      throw new ApplicationError("Field 'username' is required.", 400);
    }

    return username;
  }
}

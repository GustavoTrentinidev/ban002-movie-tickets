import { ApplicationError } from "@/core/application/errors/application-error";
import type { User } from "@/core/domain/entities/user";
import type { UserRepository } from "@/core/domain/repositories/user-repository";

export interface UpdateUserUseCaseInput {
  id: number;
  username?: string;
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserUseCaseInput): Promise<User> {
    const id = this.normalizePositiveInt(input.id, "id");

    if (input.username === undefined) {
      throw new ApplicationError("At least one field must be provided to update.", 400);
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApplicationError("User not found.", 404);
    }

    const username = this.normalizeUsername(input.username);

    return this.userRepository.update(id, { username });
  }

  private normalizePositiveInt(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${field}' must be a positive integer.`, 400);
    }

    return value;
  }

  private normalizeUsername(value: string): string {
    const username = value?.trim();
    if (!username) {
      throw new ApplicationError("Field 'username' is required.", 400);
    }

    return username;
  }
}

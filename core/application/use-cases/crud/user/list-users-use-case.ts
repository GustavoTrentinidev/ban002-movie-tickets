import type { User } from "@/core/domain/entities/user";
import type { UserRepository } from "@/core/domain/repositories/user-repository";

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}

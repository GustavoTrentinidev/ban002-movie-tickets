import { ApplicationError } from "@/core/application/errors/application-error";
import type { UserRepository } from "@/core/domain/repositories/user-repository";

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Field 'id' must be a positive integer.", 400);
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApplicationError("User not found.", 404);
    }

    await this.userRepository.deleteById(id);
  }
}

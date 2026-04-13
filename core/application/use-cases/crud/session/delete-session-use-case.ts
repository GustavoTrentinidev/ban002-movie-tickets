import { ApplicationError } from "@/core/application/errors/application-error";
import type { SessionRepository } from "@/core/domain/repositories/session-repository";

export class DeleteSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Field 'id' must be a positive integer.", 400);
    }

    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new ApplicationError("Session not found.", 404);
    }

    await this.sessionRepository.deleteById(id);
  }
}

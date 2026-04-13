import { ApplicationError } from "@/core/application/errors/application-error";
import type { SeatRepository } from "@/core/domain/repositories/seat-repository";

export class DeleteSeatUseCase {
  constructor(private readonly seatRepository: SeatRepository) {}

  async execute(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Field 'id' must be a positive integer.", 400);
    }

    const seat = await this.seatRepository.findById(id);
    if (!seat) {
      throw new ApplicationError("Seat not found.", 404);
    }

    await this.seatRepository.deleteById(id);
  }
}

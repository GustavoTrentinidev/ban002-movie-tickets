import { ApplicationError } from "@/core/application/errors/application-error";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";

export class DeleteOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Field 'id' must be a positive integer.", 400);
    }

    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new ApplicationError("Order not found.", 404);
    }

    await this.orderRepository.deleteById(id);
  }
}

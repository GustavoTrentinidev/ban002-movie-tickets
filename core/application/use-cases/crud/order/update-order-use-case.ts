import { ApplicationError } from "@/core/application/errors/application-error";
import type { Order } from "@/core/domain/entities/order";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";

export interface UpdateOrderUseCaseInput {
  id: number;
  userId?: number;
  status?: number;
}

export class UpdateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: UpdateOrderUseCaseInput): Promise<Order> {
    const id = this.normalizePositiveInt(input.id, "id");

    if (input.userId === undefined && input.status === undefined) {
      throw new ApplicationError("At least one field must be provided to update.", 400);
    }

    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new ApplicationError("Order not found.", 404);
    }

    const userId =
      input.userId !== undefined
        ? this.normalizePositiveInt(input.userId, "userId")
        : undefined;
    const status =
      input.status !== undefined
        ? this.normalizeStatus(input.status)
        : undefined;

    if (userId !== undefined) {
      const userExists = await this.orderRepository.userExists(userId);
      if (!userExists) {
        throw new ApplicationError("User not found.", 404);
      }
    }

    return this.orderRepository.update(id, {
      userId,
      status,
    });
  }

  private normalizePositiveInt(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${field}' must be a positive integer.`, 400);
    }

    return value;
  }

  private normalizeStatus(value: number): number {
    if (!Number.isInteger(value)) {
      throw new ApplicationError("Field 'status' must be an integer.", 400);
    }

    return value;
  }
}

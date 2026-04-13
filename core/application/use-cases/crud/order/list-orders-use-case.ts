import type { OrderRepository, OrderWithTickets } from "@/core/domain/repositories/order-repository";

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<OrderWithTickets[]> {
    return this.orderRepository.findAll();
  }
}

import { OrderController } from "@/core/application/controllers/order-controller";
import { CreateOrderUseCase } from "@/core/application/use-cases/crud/order/create-order-use-case";
import { DeleteOrderUseCase } from "@/core/application/use-cases/crud/order/delete-order-use-case";
import { ListOrdersUseCase } from "@/core/application/use-cases/crud/order/list-orders-use-case";
import { UpdateOrderUseCase } from "@/core/application/use-cases/crud/order/update-order-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

export const runtime = "nodejs";

function buildOrderController(): OrderController {
  const repository = repositoryFactory.order();
  const createOrderUseCase = new CreateOrderUseCase(repository);
  const listOrdersUseCase = new ListOrdersUseCase(repository);
  const updateOrderUseCase = new UpdateOrderUseCase(repository);
  const deleteOrderUseCase = new DeleteOrderUseCase(repository);

  return new OrderController(
    createOrderUseCase,
    listOrdersUseCase,
    updateOrderUseCase,
    deleteOrderUseCase
  );
}

export async function GET(): Promise<Response> {
  const controller = buildOrderController();
  return controller.list();
}

export async function POST(request: Request): Promise<Response> {
  const controller = buildOrderController();
  return controller.create(request);
}

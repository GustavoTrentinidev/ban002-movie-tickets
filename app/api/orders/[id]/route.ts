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

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  const controller = buildOrderController();
  const { id } = await context.params;
  return controller.update(request, id);
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const controller = buildOrderController();
  const { id } = await context.params;
  return controller.update(request, id);
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  const controller = buildOrderController();
  const { id } = await context.params;
  return controller.delete(id);
}

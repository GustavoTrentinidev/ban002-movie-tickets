import { AbstractController } from "@/core/application/controllers/abstract-controller";
import { ApplicationError } from "@/core/application/errors/application-error";
import { requireSessionUser } from "@/core/application/auth/get-session-user";
import { CreateOrderUseCase } from "@/core/application/use-cases/crud/order/create-order-use-case";
import { DeleteOrderUseCase } from "@/core/application/use-cases/crud/order/delete-order-use-case";
import { ListOrdersUseCase } from "@/core/application/use-cases/crud/order/list-orders-use-case";
import { UpdateOrderUseCase } from "@/core/application/use-cases/crud/order/update-order-use-case";

export class OrderController extends AbstractController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase
  ) {
    super();
  }

  async create(request: Request): Promise<Response> {
    return this.execute(async () => {
      const session = await requireSessionUser();

      const body = await request.json();
      const order = await this.createOrderUseCase.execute({
        userId: session.userId,
        status: body?.status,
        sessionId: body?.sessionId,
        seatIds: body?.seatIds,
      });

      return Response.json(order, { status: 201 });
    });
  }

  async list(): Promise<Response> {
    return this.execute(async () => {
      const orders = await this.listOrdersUseCase.execute();
      return Response.json(orders, { status: 200 });
    });
  }

  async update(request: Request, idParam: string): Promise<Response> {
    return this.execute(async () => {
      const id = this.parseId(idParam);
      const body = await request.json();
      const order = await this.updateOrderUseCase.execute({
        id,
        userId: body?.userId,
        status: body?.status,
      });

      return Response.json(order, { status: 200 });
    });
  }

  async delete(idParam: string): Promise<Response> {
    return this.execute(async () => {
      const id = this.parseId(idParam);
      await this.deleteOrderUseCase.execute(id);
      return new Response(null, { status: 204 });
    });
  }

  private parseId(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Invalid order id.", 400);
    }

    return id;
  }
}

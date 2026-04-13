import { RoomController } from "@/core/application/controllers/room-controller";
import { CreateRoomUseCase } from "@/core/application/use-cases/crud/room/create-room-use-case";
import { DeleteRoomUseCase } from "@/core/application/use-cases/crud/room/delete-room-use-case";
import { ListRoomsUseCase } from "@/core/application/use-cases/crud/room/list-rooms-use-case";
import { UpdateRoomUseCase } from "@/core/application/use-cases/crud/room/update-room-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

export const runtime = "nodejs";

function buildRoomController(): RoomController {
  const repository = repositoryFactory.room();
  const createRoomUseCase = new CreateRoomUseCase(repository);
  const listRoomsUseCase = new ListRoomsUseCase(repository);
  const updateRoomUseCase = new UpdateRoomUseCase(repository);
  const deleteRoomUseCase = new DeleteRoomUseCase(repository);

  return new RoomController(
    createRoomUseCase,
    listRoomsUseCase,
    updateRoomUseCase,
    deleteRoomUseCase
  );
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  const controller = buildRoomController();
  const { id } = await context.params;
  return controller.update(request, id);
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const controller = buildRoomController();
  const { id } = await context.params;
  return controller.update(request, id);
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  const controller = buildRoomController();
  const { id } = await context.params;
  return controller.delete(id);
}

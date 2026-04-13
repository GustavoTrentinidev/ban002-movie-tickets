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

export async function GET(): Promise<Response> {
  const controller = buildRoomController();
  return controller.list();
}

export async function POST(request: Request): Promise<Response> {
  const controller = buildRoomController();
  return controller.create(request);
}

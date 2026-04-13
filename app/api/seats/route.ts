import { SeatController } from "@/core/application/controllers/seat-controller";
import { CreateSeatUseCase } from "@/core/application/use-cases/crud/seat/create-seat-use-case";
import { DeleteSeatUseCase } from "@/core/application/use-cases/crud/seat/delete-seat-use-case";
import { DeleteSeatsByRoomUseCase } from "@/core/application/use-cases/crud/seat/delete-seats-by-room-use-case";
import { ListSeatsUseCase } from "@/core/application/use-cases/crud/seat/list-seats-use-case";
import { ListSessionSeatsUseCase } from "@/core/application/use-cases/crud/seat/list-session-seats-use-case";
import { UpdateSeatUseCase } from "@/core/application/use-cases/crud/seat/update-seat-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

export const runtime = "nodejs";

function buildSeatController(): SeatController {
  const repository = repositoryFactory.seat();
  const createSeatUseCase = new CreateSeatUseCase(repository);
  const listSeatsUseCase = new ListSeatsUseCase(repository);
  const listSessionSeatsUseCase = new ListSessionSeatsUseCase(repository);
  const updateSeatUseCase = new UpdateSeatUseCase(repository);
  const deleteSeatUseCase = new DeleteSeatUseCase(repository);
  const deleteSeatsByRoomUseCase = new DeleteSeatsByRoomUseCase(repository);

  return new SeatController(
    createSeatUseCase,
    listSeatsUseCase,
    listSessionSeatsUseCase,
    updateSeatUseCase,
    deleteSeatUseCase,
    deleteSeatsByRoomUseCase
  );
}

export async function GET(request: Request): Promise<Response> {
  const controller = buildSeatController();
  return controller.list(request);
}

export async function POST(request: Request): Promise<Response> {
  const controller = buildSeatController();
  return controller.create(request);
}

export async function DELETE(request: Request): Promise<Response> {
  const controller = buildSeatController();
  return controller.deleteByRoom(request);
}
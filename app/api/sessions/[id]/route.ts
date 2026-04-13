import { SessionController } from "@/core/application/controllers/session-controller";
import { CreateSessionUseCase } from "@/core/application/use-cases/crud/session/create-session-use-case";
import { DeleteSessionUseCase } from "@/core/application/use-cases/crud/session/delete-session-use-case";
import { ListSessionsUseCase } from "@/core/application/use-cases/crud/session/list-sessions-use-case";
import { UpdateSessionUseCase } from "@/core/application/use-cases/crud/session/update-session-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

export const runtime = "nodejs";

function buildSessionController(): SessionController {
  const repository = repositoryFactory.session();
  const createSessionUseCase = new CreateSessionUseCase(repository);
  const listSessionsUseCase = new ListSessionsUseCase(repository);
  const updateSessionUseCase = new UpdateSessionUseCase(repository);
  const deleteSessionUseCase = new DeleteSessionUseCase(repository);

  return new SessionController(
    createSessionUseCase,
    listSessionsUseCase,
    updateSessionUseCase,
    deleteSessionUseCase
  );
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  const controller = buildSessionController();
  const { id } = await context.params;
  return controller.update(request, id);
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const controller = buildSessionController();
  const { id } = await context.params;
  return controller.update(request, id);
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  const controller = buildSessionController();
  const { id } = await context.params;
  return controller.delete(id);
}

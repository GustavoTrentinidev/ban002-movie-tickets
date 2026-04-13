import { UserController } from "@/core/application/controllers/user-controller";
import { CreateUserUseCase } from "@/core/application/use-cases/crud/user/create-user-use-case";
import { DeleteUserUseCase } from "@/core/application/use-cases/crud/user/delete-user-use-case";
import { ListUsersUseCase } from "@/core/application/use-cases/crud/user/list-users-use-case";
import { UpdateUserUseCase } from "@/core/application/use-cases/crud/user/update-user-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

export const runtime = "nodejs";

function buildUserController(): UserController {
  const repository = repositoryFactory.user();
  const createUserUseCase = new CreateUserUseCase(repository);
  const listUsersUseCase = new ListUsersUseCase(repository);
  const updateUserUseCase = new UpdateUserUseCase(repository);
  const deleteUserUseCase = new DeleteUserUseCase(repository);

  return new UserController(
    createUserUseCase,
    listUsersUseCase,
    updateUserUseCase,
    deleteUserUseCase
  );
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  const controller = buildUserController();
  const { id } = await context.params;
  return controller.update(request, id);
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const controller = buildUserController();
  const { id } = await context.params;
  return controller.update(request, id);
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  const controller = buildUserController();
  const { id } = await context.params;
  return controller.delete(id);
}

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

export async function GET(): Promise<Response> {
  const controller = buildUserController();
  return controller.list();
}

export async function POST(request: Request): Promise<Response> {
  const controller = buildUserController();
  return controller.create(request);
}

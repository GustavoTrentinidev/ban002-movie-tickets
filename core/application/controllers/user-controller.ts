import { AbstractController } from "@/core/application/controllers/abstract-controller";
import { ApplicationError } from "@/core/application/errors/application-error";
import { requireRole } from "@/core/application/auth/get-session-user";
import { CreateUserUseCase } from "@/core/application/use-cases/crud/user/create-user-use-case";
import { DeleteUserUseCase } from "@/core/application/use-cases/crud/user/delete-user-use-case";
import { ListUsersUseCase } from "@/core/application/use-cases/crud/user/list-users-use-case";
import { UpdateUserUseCase } from "@/core/application/use-cases/crud/user/update-user-use-case";
import { toPublicUser } from "@/core/domain/entities/user";

export class UserController extends AbstractController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase
  ) {
    super();
  }

  async create(request: Request): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const body = await request.json();
      const user = await this.createUserUseCase.execute({
        username: body?.username,
        password: body?.password,
        role: body?.role,
      });

      return Response.json(toPublicUser(user), { status: 201 });
    });
  }

  async list(): Promise<Response> {
    return this.execute(async () => {
      const users = await this.listUsersUseCase.execute();
      return Response.json(users.map(toPublicUser), { status: 200 });
    });
  }

  async update(request: Request, idParam: string): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const id = this.parseId(idParam);
      const body = await request.json();
      const user = await this.updateUserUseCase.execute({
        id,
        username: body?.username,
        password: body?.password,
        role: body?.role,
      });

      return Response.json(toPublicUser(user), { status: 200 });
    });
  }

  async delete(idParam: string): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const id = this.parseId(idParam);
      await this.deleteUserUseCase.execute(id);
      return new Response(null, { status: 204 });
    });
  }

  private parseId(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Invalid user id.", 400);
    }

    return id;
  }
}

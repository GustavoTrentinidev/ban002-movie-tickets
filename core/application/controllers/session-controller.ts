import { AbstractController } from "@/core/application/controllers/abstract-controller";
import { ApplicationError } from "@/core/application/errors/application-error";
import { requireRole } from "@/core/application/auth/get-session-user";
import { CreateSessionUseCase } from "@/core/application/use-cases/crud/session/create-session-use-case";
import { DeleteSessionUseCase } from "@/core/application/use-cases/crud/session/delete-session-use-case";
import { ListSessionsUseCase } from "@/core/application/use-cases/crud/session/list-sessions-use-case";
import { UpdateSessionUseCase } from "@/core/application/use-cases/crud/session/update-session-use-case";

export class SessionController extends AbstractController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly listSessionsUseCase: ListSessionsUseCase,
    private readonly updateSessionUseCase: UpdateSessionUseCase,
    private readonly deleteSessionUseCase: DeleteSessionUseCase
  ) {
    super();
  }

  async create(request: Request): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const body = await request.json();
      const session = await this.createSessionUseCase.execute({
        movieId: body?.movieId,
        roomId: body?.roomId,
        sessionTime: body?.sessionTime,
      });

      return Response.json(session, { status: 201 });
    });
  }

  async list(request: Request): Promise<Response> {
    return this.execute(async () => {
      const movieId = this.parseQueryInt(request, "movieId");
      const sessions = await this.listSessionsUseCase.execute({
        movieId: movieId ?? undefined,
      });

      return Response.json(sessions, { status: 200 });
    });
  }

  async update(request: Request, idParam: string): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const id = this.parseId(idParam);
      const body = await request.json();
      const session = await this.updateSessionUseCase.execute({
        id,
        movieId: body?.movieId,
        roomId: body?.roomId,
        sessionTime: body?.sessionTime,
      });

      return Response.json(session, { status: 200 });
    });
  }

  async delete(idParam: string): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const id = this.parseId(idParam);
      await this.deleteSessionUseCase.execute(id);
      return new Response(null, { status: 204 });
    });
  }

  private parseId(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Invalid session id.", 400);
    }

    return id;
  }

  private parseQueryInt(request: Request, paramName: string): number | null {
    const url = new URL(request.url);
    const rawValue = url.searchParams.get(paramName);
    if (rawValue === null) {
      return null;
    }

    const value = Number(rawValue);
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Query param '${paramName}' must be a positive integer.`, 400);
    }

    return value;
  }
}
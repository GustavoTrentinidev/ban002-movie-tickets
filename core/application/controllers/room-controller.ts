import { AbstractController } from "@/core/application/controllers/abstract-controller";
import { CreateRoomUseCase } from "@/core/application/use-cases/crud/room/create-room-use-case";
import { DeleteRoomUseCase } from "@/core/application/use-cases/crud/room/delete-room-use-case";
import { ListRoomsUseCase } from "@/core/application/use-cases/crud/room/list-rooms-use-case";
import { UpdateRoomUseCase } from "@/core/application/use-cases/crud/room/update-room-use-case";
import { ApplicationError } from "@/core/application/errors/application-error";
import { requireRole } from "@/core/application/auth/get-session-user";

export class RoomController extends AbstractController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly listRoomsUseCase: ListRoomsUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase
  ) {
    super();
  }

  async create(request: Request): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const body = await request.json();
      const output = await this.createRoomUseCase.execute({
        number: body?.number,
        seatsCount: body?.seatsCount,
      });

      return Response.json(output, { status: 201 });
    });
  }

  async list(): Promise<Response> {
    return this.execute(async () => {
      const rooms = await this.listRoomsUseCase.execute();
      return Response.json(rooms, { status: 200 });
    });
  }

  async update(request: Request, idParam: string): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const id = this.parseId(idParam);
      const body = await request.json();
      const room = await this.updateRoomUseCase.execute({
        id,
        number: body?.number,
      });

      return Response.json(room, { status: 200 });
    });
  }

  async delete(idParam: string): Promise<Response> {
    return this.execute(async () => {
      await requireRole("ADMIN");

      const id = this.parseId(idParam);
      await this.deleteRoomUseCase.execute(id);
      return new Response(null, { status: 204 });
    });
  }

  private parseId(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Invalid room id.", 400);
    }

    return id;
  }
}

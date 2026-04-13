import { AbstractController } from "@/core/application/controllers/abstract-controller";
import { ApplicationError } from "@/core/application/errors/application-error";
import { CreateSeatUseCase } from "@/core/application/use-cases/crud/seat/create-seat-use-case";
import { DeleteSeatUseCase } from "@/core/application/use-cases/crud/seat/delete-seat-use-case";
import { DeleteSeatsByRoomUseCase } from "@/core/application/use-cases/crud/seat/delete-seats-by-room-use-case";
import { ListSeatsUseCase } from "@/core/application/use-cases/crud/seat/list-seats-use-case";
import { ListSessionSeatsUseCase } from "@/core/application/use-cases/crud/seat/list-session-seats-use-case";
import { UpdateSeatUseCase } from "@/core/application/use-cases/crud/seat/update-seat-use-case";

export class SeatController extends AbstractController {
  constructor(
    private readonly createSeatUseCase: CreateSeatUseCase,
    private readonly listSeatsUseCase: ListSeatsUseCase,
    private readonly listSessionSeatsUseCase: ListSessionSeatsUseCase,
    private readonly updateSeatUseCase: UpdateSeatUseCase,
    private readonly deleteSeatUseCase: DeleteSeatUseCase,
    private readonly deleteSeatsByRoomUseCase: DeleteSeatsByRoomUseCase
  ) {
    super();
  }

  async create(request: Request): Promise<Response> {
    return this.execute(async () => {
      const body = await request.json();
      const seat = await this.createSeatUseCase.execute({
        roomId: body?.roomId,
        number: body?.number,
      });

      return Response.json(seat, { status: 201 });
    });
  }

  async list(request: Request): Promise<Response> {
    return this.execute(async () => {
      const roomId = this.parseQueryInt(request, "roomId");
      const seats = await this.listSeatsUseCase.execute({
        roomId: roomId ?? undefined,
      });

      return Response.json(seats, { status: 200 });
    });
  }

  async listBySession(sessionIdParam: string): Promise<Response> {
    return this.execute(async () => {
      const sessionId = this.parseSessionId(sessionIdParam);
      const sessionSeatMap = await this.listSessionSeatsUseCase.execute(sessionId);
      return Response.json(sessionSeatMap, { status: 200 });
    });
  }

  async update(request: Request, idParam: string): Promise<Response> {
    return this.execute(async () => {
      const id = this.parseId(idParam);
      const body = await request.json();
      const seat = await this.updateSeatUseCase.execute({
        id,
        roomId: body?.roomId,
        number: body?.number,
      });

      return Response.json(seat, { status: 200 });
    });
  }

  async delete(idParam: string): Promise<Response> {
    return this.execute(async () => {
      const id = this.parseId(idParam);
      await this.deleteSeatUseCase.execute(id);
      return new Response(null, { status: 204 });
    });
  }

  async deleteByRoom(request: Request): Promise<Response> {
    return this.execute(async () => {
      const roomId = this.parseQueryInt(request, "roomId");
      if (roomId === null) {
        throw new ApplicationError("Query param 'roomId' is required.", 400);
      }

      const result = await this.deleteSeatsByRoomUseCase.execute(roomId);
      return Response.json(result, { status: 200 });
    });
  }

  private parseId(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError("Invalid seat id.", 400);
    }

    return id;
  }

  private parseSessionId(value: string): number {
    const sessionId = Number(value);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      throw new ApplicationError("Invalid session id.", 400);
    }

    return sessionId;
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
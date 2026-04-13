import { ApplicationError } from "@/core/application/errors/application-error";
import { Prisma } from "@prisma/client";

export abstract class AbstractController {
  protected async execute(action: () => Promise<Response>): Promise<Response> {
    try {
      return await action();
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): Response {
    if (error instanceof SyntaxError) {
      return Response.json({ message: "Invalid JSON body." }, { status: 400 });
    }

    if (error instanceof ApplicationError) {
      return Response.json({ message: error.message }, { status: error.statusCode });
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return Response.json(
        { message: "Database unavailable. Check if PostgreSQL is running on localhost:5432." },
        { status: 503 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return Response.json(
          { message: "Unique constraint violation." },
          { status: 409 }
        );
      }

      if (error.code === "P2003") {
        return Response.json(
          { message: "Cannot delete record because there are associated records." },
          { status: 409 }
        );
      }
    }

    return Response.json({ message: "Internal server error." }, { status: 500 });
  }
}

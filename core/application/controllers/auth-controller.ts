import { cookies } from "next/headers";
import { AbstractController } from "@/core/application/controllers/abstract-controller";
import { ApplicationError } from "@/core/application/errors/application-error";
import { requireSessionUser } from "@/core/application/auth/get-session-user";
import { SESSION_COOKIE_NAME } from "@/core/application/auth/session-cookie";
import { AuthenticateUserUseCase } from "@/core/application/use-cases/auth/authenticate-user-use-case";
import { CreateUserUseCase } from "@/core/application/use-cases/crud/user/create-user-use-case";
import { toPublicUser, type User } from "@/core/domain/entities/user";
import type { SessionTokenService } from "@/core/domain/services/session-token-service";
import type { UserRepository } from "@/core/domain/repositories/user-repository";

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export class AuthController extends AbstractController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly sessionTokenService: SessionTokenService,
    private readonly userRepository: UserRepository
  ) {
    super();
  }

  async login(request: Request): Promise<Response> {
    return this.execute(async () => {
      const body = await request.json();
      const user = await this.authenticateUserUseCase.execute({
        username: body?.username,
        password: body?.password,
      });

      return this.startSession(user, 200);
    });
  }

  async register(request: Request): Promise<Response> {
    return this.execute(async () => {
      const body = await request.json();
      // Educational project: the register screen exposes an ADMIN/DEFAULT toggle for
      // testing purposes, so self-registration is allowed to grant ADMIN directly.
      // This would be a privilege-escalation hole in a real product.
      const user = await this.createUserUseCase.execute({
        username: body?.username,
        password: body?.password,
        role: body?.role,
      });

      return this.startSession(user, 201);
    });
  }

  private async startSession(user: User, status: number): Promise<Response> {
    const token = await this.sessionTokenService.sign({ userId: user.id, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      // This deployment is plain HTTP only (local Docker Compose, accessed from LAN
      // devices per the project's operational requirements) — no TLS is ever terminated,
      // so a `Secure` cookie would be silently dropped by browsers on non-localhost hosts.
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return Response.json(toPublicUser(user), { status });
  }

  async logout(): Promise<Response> {
    return this.execute(async () => {
      const cookieStore = await cookies();
      cookieStore.delete(SESSION_COOKIE_NAME);
      return new Response(null, { status: 204 });
    });
  }

  async me(): Promise<Response> {
    return this.execute(async () => {
      const session = await requireSessionUser();
      const user = await this.userRepository.findById(session.userId);
      if (!user) {
        throw new ApplicationError("Authentication required.", 401);
      }

      return Response.json(toPublicUser(user), { status: 200 });
    });
  }
}

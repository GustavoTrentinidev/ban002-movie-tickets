import { AuthController } from "@/core/application/controllers/auth-controller";
import { AuthenticateUserUseCase } from "@/core/application/use-cases/auth/authenticate-user-use-case";
import { CreateUserUseCase } from "@/core/application/use-cases/crud/user/create-user-use-case";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";
import { securityFactory } from "@/core/infrastructure/security/security-factory";

export const runtime = "nodejs";

function buildAuthController(): AuthController {
  const userRepository = repositoryFactory.user();
  const passwordHasher = securityFactory.passwordHasher();
  const sessionTokenService = securityFactory.sessionTokenService();
  const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, passwordHasher);
  const createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher);

  return new AuthController(authenticateUserUseCase, createUserUseCase, sessionTokenService, userRepository);
}

export async function POST(): Promise<Response> {
  const controller = buildAuthController();
  return controller.logout();
}

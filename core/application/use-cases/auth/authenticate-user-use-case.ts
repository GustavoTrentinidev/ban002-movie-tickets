import { ApplicationError } from "@/core/application/errors/application-error";
import type { User } from "@/core/domain/entities/user";
import type { PasswordHasher } from "@/core/domain/services/password-hasher";
import type { UserRepository } from "@/core/domain/repositories/user-repository";

export interface AuthenticateUserUseCaseInput {
  username: string;
  password: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: AuthenticateUserUseCaseInput): Promise<User> {
    const username = input.username?.trim();
    const password = input.password;

    if (!username || !password) {
      throw new ApplicationError("Invalid credentials.", 401);
    }

    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new ApplicationError("Invalid credentials.", 401);
    }

    const passwordMatches = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApplicationError("Invalid credentials.", 401);
    }

    return user;
  }
}

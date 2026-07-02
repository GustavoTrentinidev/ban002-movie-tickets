import { ApplicationError } from "@/core/application/errors/application-error";
import type { User, UserRole } from "@/core/domain/entities/user";
import type { PasswordHasher } from "@/core/domain/services/password-hasher";
import type { UserRepository } from "@/core/domain/repositories/user-repository";

const VALID_ROLES: UserRole[] = ["ADMIN", "DEFAULT"];
const MIN_PASSWORD_LENGTH = 8;

export interface CreateUserUseCaseInput {
  username: string;
  password: string;
  role?: UserRole;
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: CreateUserUseCaseInput): Promise<User> {
    const username = this.normalizeUsername(input.username);
    const password = this.normalizePassword(input.password);
    const role = this.normalizeRole(input.role);

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new ApplicationError("Username is already taken.", 409);
    }

    const passwordHash = await this.passwordHasher.hash(password);

    return this.userRepository.create({
      username,
      passwordHash,
      role,
    });
  }

  private normalizeUsername(value: string): string {
    const username = value?.trim();
    if (!username) {
      throw new ApplicationError("Field 'username' is required.", 400);
    }

    return username;
  }

  private normalizePassword(value: string): string {
    if (!value || value.length < MIN_PASSWORD_LENGTH) {
      throw new ApplicationError(
        `Field 'password' must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        400
      );
    }

    return value;
  }

  private normalizeRole(value: UserRole | undefined): UserRole {
    if (value === undefined) {
      return "DEFAULT";
    }

    if (!VALID_ROLES.includes(value)) {
      throw new ApplicationError("Field 'role' must be 'ADMIN' or 'DEFAULT'.", 400);
    }

    return value;
  }
}

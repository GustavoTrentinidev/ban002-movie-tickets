import { ApplicationError } from "@/core/application/errors/application-error";
import type { User, UserRole } from "@/core/domain/entities/user";
import type { PasswordHasher } from "@/core/domain/services/password-hasher";
import type { UserRepository } from "@/core/domain/repositories/user-repository";

const VALID_ROLES: UserRole[] = ["ADMIN", "DEFAULT"];
const MIN_PASSWORD_LENGTH = 8;

export interface UpdateUserUseCaseInput {
  id: number;
  username?: string;
  password?: string;
  role?: UserRole;
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: UpdateUserUseCaseInput): Promise<User> {
    const id = this.normalizePositiveInt(input.id, "id");

    if (input.username === undefined && input.password === undefined && input.role === undefined) {
      throw new ApplicationError("At least one field must be provided to update.", 400);
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApplicationError("User not found.", 404);
    }

    const username = input.username === undefined ? undefined : this.normalizeUsername(input.username);
    const role = input.role === undefined ? undefined : this.normalizeRole(input.role);
    const passwordHash =
      input.password === undefined ? undefined : await this.passwordHasher.hash(this.normalizePassword(input.password));

    return this.userRepository.update(id, { username, passwordHash, role });
  }

  private normalizePositiveInt(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ApplicationError(`Field '${field}' must be a positive integer.`, 400);
    }

    return value;
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

  private normalizeRole(value: UserRole): UserRole {
    if (!VALID_ROLES.includes(value)) {
      throw new ApplicationError("Field 'role' must be 'ADMIN' or 'DEFAULT'.", 400);
    }

    return value;
  }
}

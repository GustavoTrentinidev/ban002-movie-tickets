export type UserRole = "ADMIN" | "DEFAULT";

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
  };
}

import type { UserRole } from "@/core/domain/entities/user";

export interface SessionPayload {
  userId: number;
  role: UserRole;
}

export interface SessionTokenService {
  sign(payload: SessionPayload): Promise<string>;
  verify(token: string): Promise<SessionPayload | null>;
}

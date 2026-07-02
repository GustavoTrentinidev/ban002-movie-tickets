import { cookies } from "next/headers";
import { ApplicationError } from "@/core/application/errors/application-error";
import { SESSION_COOKIE_NAME } from "@/core/application/auth/session-cookie";
import type { UserRole } from "@/core/domain/entities/user";
import type { SessionPayload } from "@/core/domain/services/session-token-service";
import { securityFactory } from "@/core/infrastructure/security/security-factory";

export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return securityFactory.sessionTokenService().verify(token);
}

export async function requireSessionUser(): Promise<SessionPayload> {
  const user = await getSessionUser();
  if (!user) {
    throw new ApplicationError("Authentication required.", 401);
  }

  return user;
}

export async function requireRole(role: UserRole): Promise<SessionPayload> {
  const user = await requireSessionUser();
  if (user.role !== role) {
    throw new ApplicationError("Forbidden.", 403);
  }

  return user;
}

import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload, SessionTokenService } from "@/core/domain/services/session-token-service";

const SESSION_EXPIRATION = "7d";
const JWT_ALGORITHM = "HS256";

export class JoseSessionTokenService implements SessionTokenService {
  private readonly secretKey: Uint8Array;

  constructor() {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      throw new Error("Environment variable 'SESSION_SECRET' is required to sign sessions.");
    }

    this.secretKey = new TextEncoder().encode(secret);
  }

  async sign(payload: SessionPayload): Promise<string> {
    return new SignJWT({ userId: payload.userId, role: payload.role })
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(SESSION_EXPIRATION)
      .sign(this.secretKey);
  }

  async verify(token: string): Promise<SessionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey, {
        algorithms: [JWT_ALGORITHM],
      });

      if (typeof payload.userId !== "number" || (payload.role !== "ADMIN" && payload.role !== "DEFAULT")) {
        return null;
      }

      return { userId: payload.userId, role: payload.role };
    } catch {
      return null;
    }
  }
}

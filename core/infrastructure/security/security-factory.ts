import type { PasswordHasher } from "@/core/domain/services/password-hasher";
import type { SessionTokenService } from "@/core/domain/services/session-token-service";
import { BcryptjsPasswordHasher } from "@/core/infrastructure/security/bcryptjs-password-hasher";
import { JoseSessionTokenService } from "@/core/infrastructure/security/jose-session-token-service";

export interface SecurityFactory {
  passwordHasher(): PasswordHasher;
  sessionTokenService(): SessionTokenService;
}

class DefaultSecurityFactory implements SecurityFactory {
  passwordHasher(): PasswordHasher {
    return new BcryptjsPasswordHasher();
  }

  sessionTokenService(): SessionTokenService {
    return new JoseSessionTokenService();
  }
}

export const securityFactory: SecurityFactory = new DefaultSecurityFactory();

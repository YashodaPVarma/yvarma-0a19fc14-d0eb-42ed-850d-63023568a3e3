// apps/api/src/app/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: number;
  email: string;
  role: string;
  orgId: number;
};

// Must match the secret configured in AuthModule
const JWT_SECRET = 'super-secret-jwt-key';

/**
 * JWT authentication strategy used by Nest's Passport system.
 * Extracts the token from the Authorization header and verifies it.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Read JWT from the Authorization: Bearer <token> header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Expired tokens should be rejected
      ignoreExpiration: false,

      // Secret used to validate signature
      secretOrKey: JWT_SECRET,
    });
  }

  /**
   * Called automatically once the JWT is verified.
   * Whatever is returned here is assigned to req.user.
   */
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      orgId: payload.orgId,
    };
  }
}

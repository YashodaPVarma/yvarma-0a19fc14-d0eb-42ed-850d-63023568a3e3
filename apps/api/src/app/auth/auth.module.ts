// apps/api/src/app/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

import { UserEntity } from '../entities/user.entity';

const JWT_SECRET = 'super-secret-jwt-key';
const JWT_EXPIRES_IN = '1h';

/**
 * Authentication module.
 * Provides login, JWT generation, validation, and Passport strategy wiring.
 */
@Module({
  imports: [
    // Make UserEntity available to the AuthService through TypeORM
    TypeOrmModule.forFeature([UserEntity]),

    // Required for Nest's auth ecosystem (guards/strategies)
    PassportModule,

    // Registers JWT support with signing options
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
  ],

  // REST API endpoints
  controllers: [AuthController],

  // Auth logic and JWT validation strategy
  providers: [AuthService, JwtStrategy],

  // Export AuthService so other modules (e.g., TasksModule) can use it
  exports: [AuthService],
})
export class AuthModule {}

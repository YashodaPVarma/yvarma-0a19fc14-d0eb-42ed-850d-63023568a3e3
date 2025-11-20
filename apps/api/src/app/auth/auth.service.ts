// apps/api/src/app/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UserEntity } from '../entities/user.entity';

/**
 * Handles authentication, credential validation, and
 * JWT token generation for the API.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials:
   * - Looks up user by email
   * - Compares password hash using bcrypt
   * Throws UnauthorizedException if either check fails.
   */
  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({
      where: { email },
      relations: ['organization'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Generates a signed JWT for an authenticated user and returns
   * a safe, frontend-friendly user object (without password).
   */
  async login(user: UserEntity) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organization.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
        },
      },
    };
  }

  /**
   * Fetches a user by ID with selected public fields.
   * Used for /auth/profile and other safe lookups.
   */
  async getUserById(id: number) {
    return this.usersRepo.findOne({
      where: { id },
      relations: ['organization'],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: {
          id: true,
          name: true,
        },
      },
    });
  }
}

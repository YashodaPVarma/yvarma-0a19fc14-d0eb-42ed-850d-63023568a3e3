// apps/api/src/app/auth/auth.service.spec.ts
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserEntity } from '../entities/user.entity';

// mock bcrypt for these tests
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const usersRepo = {
    findOne: jest.fn(),
  } as any;

  const jwtService = {
    sign: jest.fn().mockReturnValue('fake-jwt-token'),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(usersRepo as any, jwtService as any);
  });

  it('should throw UnauthorizedException if user not found', async () => {
    usersRepo.findOne.mockResolvedValue(null);

    await expect(
      service.validateUser('no@user.com', 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    const user = {
      id: 1,
      email: 'test@demo.com',
      passwordHash: 'hash',
    } as UserEntity;

    usersRepo.findOne.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.validateUser('test@demo.com', 'wrongpassword'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should return user when credentials are valid', async () => {
    const user = {
      id: 1,
      email: 'test@demo.com',
      passwordHash: 'hash',
      organization: { id: 1, name: 'Org' },
      role: 'ADMIN',
      name: 'Test User',
    } as any;

    usersRepo.findOne.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('test@demo.com', 'password');

    expect(result).toBe(user);
  });

  it('login() should return a signed JWT and safe user object', async () => {
    const user = {
      id: 1,
      email: 'admin@demo.com',
      passwordHash: 'hash',
      organization: { id: 1, name: 'Head Office' },
      role: 'ADMIN',
      name: 'Admin User',
    } as any;

    const res = await service.login(user);

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organization.id,
    });

    expect(res).toEqual({
      access_token: 'fake-jwt-token',
      user: {
        id: 1,
        email: 'admin@demo.com',
        name: 'Admin User',
        role: 'ADMIN',
        organization: {
          id: 1,
          name: 'Head Office',
        },
      },
    });
  });
});

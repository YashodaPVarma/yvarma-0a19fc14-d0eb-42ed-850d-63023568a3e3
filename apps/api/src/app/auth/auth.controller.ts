import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from '../../../../../libs/data/src/lib/dto/login.dto';
import { JwtAuthGuard } from '../../../../../libs/auth/src/lib/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Authenticates a user using email + password and returns a JWT + user info.
   */
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  /**
   * GET /auth/profile
   * Protected route – requires a valid JWT.
   * Returns the authenticated user's profile.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.authService.getUserById(req.user.userId);
    return user;
  }
}

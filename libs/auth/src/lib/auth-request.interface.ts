// libs/auth/src/lib/auth-request.interface.ts
import { Request } from 'express';

export interface AuthUser {
  userId: number;
  email: string;
  role: string; // we treat it as string here; services can cast to UserRole
  orgId: number;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}

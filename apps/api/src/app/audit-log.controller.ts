// apps/api/src/app/audit-log.controller.ts
import { Controller, Get, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

import { AuditLogService } from './audit-log.service';
import { UserRole } from '../../../../libs/data/src/lib/user-role.enum';
import { AuthRequest } from '../../../../libs/auth/src/lib/auth-request.interface';
import { JwtAuthGuard } from '../../../../libs/auth/src/lib/jwt-auth.guard';

/** Controller exposing audit log access for authorized roles. */
@UseGuards(JwtAuthGuard)
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /** Return full audit log for ADMIN or OWNER roles. */
  @Get()
  getAuditLog(@Req() req: AuthRequest) {
    const role = req.user.role as UserRole;

    if (role !== UserRole.ADMIN && role !== UserRole.OWNER) {
      throw new ForbiddenException('Only ADMIN or OWNER can view audit log');
    }

    return this.auditLogService.getAll();
  }
}

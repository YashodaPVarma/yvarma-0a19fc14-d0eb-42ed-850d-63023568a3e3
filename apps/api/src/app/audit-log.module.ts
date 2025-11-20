// apps/api/src/app/audit-log.module.ts
import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';

/** Module providing audit log storage and access. */
@Module({
  providers: [AuditLogService],
  controllers: [AuditLogController],
  /** Export service for use in other modules (e.g., TasksModule). */
  exports: [AuditLogService],
})
export class AuditLogModule {}

// apps/api/src/app/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

// Entities this module depends on
import { TaskEntity } from '../entities/task.entity';
import { UserEntity } from '../entities/user.entity';
import { OrganizationEntity } from '../entities/organization.entity';

// Audit logging (optional extension module)
import { AuditLogModule } from '../audit-log.module';

/**
 * TasksModule
 * Wires together controller, service, and entity repositories used for all
 * task-related operations. This module exposes REST endpoints through the controller
 * and relies on TypeORM repositories for persistence.
 */
@Module({
  imports: [
    // Registers the repositories for the three entities this module needs.
    TypeOrmModule.forFeature([TaskEntity, UserEntity, OrganizationEntity]),

    // Brings in audit logging functionality; safe to remove if not needed.
    AuditLogModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserEntity } from './entities/user.entity';
import { OrganizationEntity } from './entities/organization.entity';
import { TaskEntity } from './entities/task.entity';
import { DebugController } from './debug.controller';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogModule } from './audit-log.module';

/** Root application module configuring ORM, feature modules, and controllers. */
@Module({
  imports: [
    /** Database configuration using SQLite for local persistence. */
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [UserEntity, OrganizationEntity, TaskEntity],
      synchronize: true,
      logging: true,
    }),

    /** Register core entities for repository injection. */
    TypeOrmModule.forFeature([UserEntity, OrganizationEntity, TaskEntity]),

    /** Feature modules. */
    AuthModule,
    TasksModule,
    AuditLogModule,
  ],
  controllers: [AppController, DebugController],
  providers: [AppService],
})
export class AppModule {}

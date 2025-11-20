// apps/api/src/app/tasks/tasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';

import { TasksService } from './tasks.service';

// DTOs pulled from shared library
import { CreateTaskDto } from '../../../../../libs/data/src/lib/dto/create-task.dto';
import { UpdateTaskDto } from '../../../../../libs/data/src/lib/dto/update-task.dto';
import { UpdateTaskStatusDto } from '../../../../../libs/data/src/lib/dto/update-task-status.dto';

// User roles from shared enum
import { UserRole } from '../../../../../libs/data/src/lib/user-role.enum';

// Auth guard + request typing from shared auth lib
import { JwtAuthGuard } from '../../../../../libs/auth/src/lib/jwt-auth.guard';
import { AuthRequest } from '../../../../../libs/auth/src/lib/auth-request.interface';

/**
 * TasksController
 * Handles REST endpoints for task creation, retrieval, updates and deletion.
 * Access is restricted using JWT authentication; the service enforces RBAC rules.
 */
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * GET /api/tasks
   * Returns tasks visible to the current user based on RBAC rules.
   */
  @Get()
  async getTasks(@Req() req: AuthRequest) {
    return this.tasksService.getTasksForUser(req.user);
  }

  /**
   * POST /api/tasks
   * Creates a new task. Only ADMIN/OWNER can create.
   */
  @Post()
  async createTask(@Req() req: AuthRequest, @Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(req.user, dto);
  }

  /**
   * PUT /api/tasks/:id
   * Updates task fields (title, description, category, assignee, status).
   */
  @Put(':id')
  async updateTask(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(req.user, id, dto);
  }

  /**
   * DELETE /api/tasks/:id
   * Deletes a task. Restricted to ADMIN/OWNER.
   */
  @Delete(':id')
  async deleteTask(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.deleteTask(req.user, id);
  }

  /**
   * PATCH /api/tasks/:id/status
   * Updates only the task status (OPEN → IN_PROGRESS → DONE etc.).
   */
  @Patch(':id/status')
  async updateTaskStatus(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(req.user, id, dto);
  }
}

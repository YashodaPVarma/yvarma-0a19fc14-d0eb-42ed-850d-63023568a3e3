// apps/api/src/app/tasks/tasks.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from '../entities/task.entity';
import { UserEntity } from '../entities/user.entity';
import { OrganizationEntity } from '../entities/organization.entity';
import { CreateTaskDto } from '../../../../../libs/data/src/lib/dto/create-task.dto';
import { UpdateTaskDto } from '../../../../../libs/data/src/lib/dto/update-task.dto';
import { AuditLogService } from '../audit-log.service';
import { UserRole } from '../../../../../libs/data/src/lib/user-role.enum';
import { TaskStatus } from '../../../../../libs/data/src/lib/task-status.enum';
import { CurrentUser } from '../../../../../libs/data/src/lib/current-user.interface';

/** Service handling task operations with RBAC and audit logging. */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepo: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(OrganizationEntity)
    private readonly orgRepo: Repository<OrganizationEntity>,
    private readonly auditLog: AuditLogService
  ) {}

  /** Check if user has admin role. */
  private isAdmin(user: CurrentUser) {
    return user.role === UserRole.ADMIN;
  }

  /** Check if user has owner role. */
  private isOwner(user: CurrentUser) {
    return user.role === UserRole.OWNER;
  }

  /** Check if user has viewer role. */
  private isViewer(user: CurrentUser) {
    return user.role === UserRole.VIEWER;
  }

  /** Return tasks visible to the user based on role and organization. */
  async getTasksForUser(currentUser: CurrentUser) {
    const baseQuery = this.tasksRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.organization', 'org')
      .leftJoinAndSelect('assignee.organization', 'assigneeOrg')
      .leftJoinAndSelect('createdBy.organization', 'createdByOrg');

    const mapTask = (t: TaskEntity) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      category: t.category ?? null,

      createdBy: t.createdBy
        ? {
            id: t.createdBy.id,
            name: t.createdBy.name ?? t.createdBy.email,
            email: t.createdBy.email,
          }
        : null,

      assignee: t.assignee
        ? {
            id: t.assignee.id,
            name: t.assignee.name ?? t.assignee.email,
            email: t.assignee.email,
          }
        : null,
    });

    // Admin: all tasks
    if (this.isAdmin(currentUser)) {
      const tasks = await baseQuery.getMany();
      return tasks.map(mapTask);
    }

    // Owner: tasks in org or assigned to them
    if (this.isOwner(currentUser)) {
      const tasks = await baseQuery
        .where('org.id = :orgId', { orgId: currentUser.orgId })
        .orWhere('assigneeOrg.id = :orgId', { orgId: currentUser.orgId })
        .orWhere('createdByOrg.id = :orgId', { orgId: currentUser.orgId })
        .orWhere('assignee.id = :userId', { userId: currentUser.userId })
        .getMany();

      return tasks.map(mapTask);
    }

    // Viewer: only assigned tasks
    if (this.isViewer(currentUser)) {
      const tasks = await baseQuery
        .where('assignee.id = :userId', { userId: currentUser.userId })
        .getMany();

      return tasks.map(mapTask);
    }

    return [];
  }

  /** Create a new task with assignment and org validation. */
  async createTask(currentUser: CurrentUser, dto: CreateTaskDto) {
    if (this.isViewer(currentUser)) {
      throw new ForbiddenException('VIEWER cannot create tasks');
    }

    const org = await this.orgRepo.findOneBy({ id: currentUser.orgId });
    if (!org) {
      throw new ForbiddenException('Organization not found for user');
    }

    const creator = await this.usersRepo.findOneBy({ id: currentUser.userId });
    if (!creator) {
      throw new ForbiddenException('User not found');
    }

    let assignee: UserEntity | null = null;
    if (dto.assigneeId) {
      assignee = await this.usersRepo.findOne({
        where: { id: dto.assigneeId },
        relations: ['organization'],
      });
      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      // Non-admin cannot assign outside org
      if (
        !this.isAdmin(currentUser) &&
        assignee.organization.id !== currentUser.orgId
      ) {
        throw new ForbiddenException(
          'Cannot assign tasks outside your organization'
        );
      }
    }

    const task = this.tasksRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      category: dto.category ?? null,
      status: TaskStatus.OPEN,
      createdBy: creator,
      assignee: assignee ?? null,
      organization: org,
    });

    const saved = await this.tasksRepo.save(task);

    this.auditLog.log({
      timestamp: new Date().toISOString(),
      actorEmail: currentUser.email,
      actorRole: currentUser.role as string,
      actorOrgId: currentUser.orgId,
      action: 'CREATE_TASK',
      details: { taskId: saved.id, title: saved.title },
    });

    return saved;
  }

  /** Update task fields with role and org access control. */
async updateTask(currentUser: CurrentUser, id: number, dto: UpdateTaskDto) {
  const task = await this.tasksRepo.findOne({
    where: { id },
    relations: ['organization', 'assignee'],
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  // 🔐 RBAC: who is allowed to update this task?
  if (!this.isAdmin(currentUser)) {
    // VIEWER: never allowed to update
    if (this.isViewer(currentUser)) {
      throw new ForbiddenException('VIEWER cannot update tasks');
    }

    // OWNER: allowed if task is in their org OR currently assigned to them
    if (this.isOwner(currentUser)) {
      const isSameOrg =
        task.organization && task.organization.id === currentUser.orgId;
      const isAssignedToOwner =
        task.assignee && task.assignee.id === currentUser.userId;

      if (!isSameOrg && !isAssignedToOwner) {
        throw new ForbiddenException(
          'Owners can only update tasks in their organization or tasks assigned to them'
        );
      }
    } else {
      // any other non-admin role (safety net)
      throw new ForbiddenException('You cannot update this task');
    }
  }

  // ✅ At this point, user is allowed to update the task

  if (dto.title !== undefined) task.title = dto.title;
  if (dto.description !== undefined) task.description = dto.description;
  if (dto.category !== undefined) task.category = dto.category;
  if (dto.status !== undefined) task.status = dto.status;

  // 🔁 Assignee change logic (still enforces "within org" for non-admins)
  if (dto.assigneeId !== undefined) {
    if (dto.assigneeId === (null as any)) {
      task.assignee = null;
    } else {
      const assignee = await this.usersRepo.findOne({
        where: { id: dto.assigneeId },
        relations: ['organization'],
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      // Non-admin cannot assign outside org (OWNER included)
      if (
        !this.isAdmin(currentUser) &&
        assignee.organization.id !== currentUser.orgId
      ) {
        throw new ForbiddenException(
          'Cannot assign tasks outside your organization'
        );
      }

      task.assignee = assignee;
    }
  }

  const saved = await this.tasksRepo.save(task);

  this.auditLog.log({
    timestamp: new Date().toISOString(),
    actorEmail: currentUser.email,
    actorRole: currentUser.role as string,
    actorOrgId: currentUser.orgId,
    action: 'UPDATE_TASK',
    details: { taskId: saved.id },
  });

  return saved;
}


  /** Delete a task with proper role and org restrictions. */
  async deleteTask(currentUser: CurrentUser, id: number) {
    const task = await this.tasksRepo.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!this.isAdmin(currentUser)) {
      if (
        !this.isOwner(currentUser) ||
        task.organization.id !== currentUser.orgId
      ) {
        throw new ForbiddenException('You cannot delete this task');
      }
    }

    await this.tasksRepo.remove(task);

    this.auditLog.log({
      timestamp: new Date().toISOString(),
      actorEmail: currentUser.email,
      actorRole: currentUser.role as string,
      actorOrgId: currentUser.orgId,
      action: 'DELETE_TASK',
      details: { taskId: id },
    });

    return { success: true };
  }

  /** Update task status with assignment and organization validation. */
  async updateTaskStatus(
    currentUser: CurrentUser,
    taskId: number,
    dto: { status: TaskStatus }
  ): Promise<TaskEntity> {
    const task = await this.tasksRepo.findOne({
      where: { id: taskId },
      relations: ['organization', 'assignee'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Viewer: can only update their assigned tasks
    if (this.isViewer(currentUser)) {
      if (!task.assignee || task.assignee.id !== currentUser.userId) {
        throw new ForbiddenException(
          'You can only update status for tasks assigned to you'
        );
      }
    }
    // Owner and other non-admins must match org
    else if (!this.isAdmin(currentUser)) {
      if (!task.organization || task.organization.id !== currentUser.orgId) {
        throw new ForbiddenException(
          'You cannot update tasks in another organization'
        );
      }
    }

    task.status = dto.status;

    const saved = await this.tasksRepo.save(task);

    this.auditLog.log({
      timestamp: new Date().toISOString(),
      actorEmail: currentUser.email,
      actorRole: currentUser.role as string,
      actorOrgId: currentUser.orgId,
      action: 'UPDATE_TASK_STATUS',
      details: { taskId: saved.id, status: saved.status },
    });

    return saved;
  }
}

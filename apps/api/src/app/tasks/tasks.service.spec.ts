// apps/api/src/app/tasks/tasks.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TasksService } from './tasks.service';
import { TaskEntity } from '../entities/task.entity';
import { UserEntity } from '../entities/user.entity';
import { OrganizationEntity } from '../entities/organization.entity';
import { AuditLogService } from '../audit-log.service';
import { TaskStatus } from '../../../../../libs/data/src/lib/task-status.enum';
import { UserRole } from '../../../../../libs/data/src/lib/user-role.enum';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

/**
 * Integration-style RBAC tests for TasksService using an in-memory SQLite DB.
 * Verifies visibility and permissions across ADMIN, OWNER and VIEWER roles.
 */
describe('TasksService RBAC', () => {
  let moduleRef: TestingModule;
  let tasksService: TasksService;
  let usersRepo: Repository<UserEntity>;
  let orgRepo: Repository<OrganizationEntity>;
  let tasksRepo: Repository<TaskEntity>;

  // Convenience helper for building a req.user-like payload
  const makeCurrentUser = (
    id: number,
    email: string,
    role: UserRole,
    orgId: number
  ) => ({ userId: id, email, role, orgId });

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        // In-memory SQLite database for realistic repository behavior
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [UserEntity, TaskEntity, OrganizationEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([UserEntity, TaskEntity, OrganizationEntity]),
      ],
      providers: [TasksService, AuditLogService],
    }).compile();

    tasksService = moduleRef.get(TasksService);
    usersRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity)
    );
    orgRepo = moduleRef.get<Repository<OrganizationEntity>>(
      getRepositoryToken(OrganizationEntity)
    );
    tasksRepo = moduleRef.get<Repository<TaskEntity>>(
      getRepositoryToken(TaskEntity)
    );

    await seedTestData();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  /**
   * Seed a small multi-org environment:
   * - Head Office with IT and HR as children
   * - Admin at Head Office
   * - OWNER + VIEWER in IT and HR
   * - One task per department
   */
  async function seedTestData() {
    // --- ORGS ---
    const headOffice = orgRepo.create({ name: 'Head Office', parent: null });
    await orgRepo.save(headOffice);

    const itDept = orgRepo.create({
      name: 'IT Department',
      parent: headOffice,
    });
    await orgRepo.save(itDept);

    const hrDept = orgRepo.create({
      name: 'HR Department',
      parent: headOffice,
    });
    await orgRepo.save(hrDept);

    // --- USERS ---
    const admin = usersRepo.create({
      email: 'admin@demo.com',
      name: 'Admin User',
      passwordHash: 'x',
      role: UserRole.ADMIN,
      organization: headOffice,
    });
    await usersRepo.save(admin);

    const itOwner = usersRepo.create({
      email: 'it.owner@demo.com',
      name: 'IT Owner',
      passwordHash: 'x',
      role: UserRole.OWNER,
      organization: itDept,
    });
    await usersRepo.save(itOwner);

    const itViewer = usersRepo.create({
      email: 'it.viewer@demo.com',
      name: 'IT Viewer',
      passwordHash: 'x',
      role: UserRole.VIEWER,
      organization: itDept,
    });
    await usersRepo.save(itViewer);

    const hrOwner = usersRepo.create({
      email: 'hr.owner@demo.com',
      name: 'HR Owner',
      passwordHash: 'x',
      role: UserRole.OWNER,
      organization: hrDept,
    });
    await usersRepo.save(hrOwner);

    const hrViewer = usersRepo.create({
      email: 'hr.viewer@demo.com',
      name: 'HR Viewer',
      passwordHash: 'x',
      role: UserRole.VIEWER,
      organization: hrDept,
    });
    await usersRepo.save(hrViewer);

    // --- TASKS ---
    // Task in IT org
    await tasksRepo.save(
      tasksRepo.create({
        title: 'IT Task 1',
        description: 'Only IT should see this',
        status: TaskStatus.OPEN,
        organization: itDept,
        createdBy: itOwner,
        assignee: itViewer,
        category: 'Work',
      })
    );

    // Task in HR org
    await tasksRepo.save(
      tasksRepo.create({
        title: 'HR Task 1',
        description: 'Only HR should see this',
        status: TaskStatus.OPEN,
        organization: hrDept,
        createdBy: hrOwner,
        assignee: hrViewer,
        category: 'Work',
      })
    );
  }

  // ---------------------------------------------------------------------------
  // ADMIN behavior
  // ---------------------------------------------------------------------------

  it('ADMIN should see all tasks from all organizations', async () => {
    const admin = await usersRepo.findOneOrFail({
      where: { email: 'admin@demo.com' },
      relations: ['organization'],
    });

    const currentUser = makeCurrentUser(
      admin.id,
      admin.email,
      admin.role,
      admin.organization.id
    );

    const tasks = await tasksService.getTasksForUser(currentUser);
    expect(tasks).toHaveLength(2);
    const titles = tasks.map((t) => t.title).sort();
    expect(titles).toEqual(['HR Task 1', 'IT Task 1']);
  });

  it('ADMIN can assign task to user in another organization', async () => {
    const admin = await usersRepo.findOneOrFail({
      where: { email: 'admin@demo.com' },
      relations: ['organization'],
    });
    const hrViewer = await usersRepo.findOneOrFail({
      where: { email: 'hr.viewer@demo.com' },
      relations: ['organization'],
    });

    const currentUser = makeCurrentUser(
      admin.id,
      admin.email,
      admin.role,
      admin.organization.id
    );

    const created = await tasksService.createTask(currentUser, {
      title: 'Admin cross-org assign',
      description: 'Allowed',
      category: 'Work',
      assigneeId: hrViewer.id,
    });

    expect(created.assignee?.id).toBe(hrViewer.id);
  });

  it('ADMIN can update tasks in any organization', async () => {
    const admin = await usersRepo.findOneOrFail({
      where: { email: 'admin@demo.com' },
      relations: ['organization'],
    });
    const currentUser = makeCurrentUser(
      admin.id,
      admin.email,
      admin.role,
      admin.organization.id
    );

    const hrTask = await tasksRepo.findOneOrFail({
      where: { title: 'HR Task 1' },
      relations: ['organization'],
    });

    const updated = await (tasksService as any).updateTaskStatus(
      currentUser,
      hrTask.id,
      {
        status: TaskStatus.DONE,
      }
    );

    expect(updated.status).toBe(TaskStatus.DONE);
  });

  // ---------------------------------------------------------------------------
  // OWNER behavior
  // ---------------------------------------------------------------------------

  it('IT OWNER should only see IT tasks', async () => {
    const itOwner = await usersRepo.findOneOrFail({
      where: { email: 'it.owner@demo.com' },
      relations: ['organization'],
    });
    const currentUser = makeCurrentUser(
      itOwner.id,
      itOwner.email,
      itOwner.role,
      itOwner.organization.id
    );

    const tasks = await tasksService.getTasksForUser(currentUser);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('IT Task 1');
  });

 it('HR OWNER should see HR tasks and any cross-org tasks assigned to HR users', async () => {
  const hrOwner = await usersRepo.findOneOrFail({
    where: { email: 'hr.owner@demo.com' },
    relations: ['organization'],
  });
  const currentUser = makeCurrentUser(
    hrOwner.id,
    hrOwner.email,
    hrOwner.role,
    hrOwner.organization.id
  );

  const tasks = await tasksService.getTasksForUser(currentUser);

  // HR owner should see:
  // - "HR Task 1" (org = HR)
  // - "Admin cross-org assign" (org = Head Office, but assignee in HR org)
  const titles = tasks.map((t) => t.title).sort();
  expect(titles).toEqual(['Admin cross-org assign', 'HR Task 1']);
});


  it('OWNER cannot assign task to user outside their organization', async () => {
    const itOwner = await usersRepo.findOneOrFail({
      where: { email: 'it.owner@demo.com' },
      relations: ['organization'],
    });
    const hrViewer = await usersRepo.findOneOrFail({
      where: { email: 'hr.viewer@demo.com' },
      relations: ['organization'],
    });

    const currentUser = makeCurrentUser(
      itOwner.id,
      itOwner.email,
      itOwner.role,
      itOwner.organization.id
    );

    await expect(
      tasksService.createTask(currentUser, {
        title: 'Cross-org assign',
        description: 'Should not be allowed',
        category: 'Work',
        assigneeId: hrViewer.id,
      })
    ).rejects.toThrow('Cannot assign tasks outside your organization');
  });

  it('OWNER can update a task inside their own organization', async () => {
    const itOwner = await usersRepo.findOneOrFail({
      where: { email: 'it.owner@demo.com' },
      relations: ['organization'],
    });
    const currentUser = makeCurrentUser(
      itOwner.id,
      itOwner.email,
      itOwner.role,
      itOwner.organization.id
    );

    const itTask = await tasksRepo.findOneOrFail({
      where: { title: 'IT Task 1' },
      relations: ['organization'],
    });

    const updated = await (tasksService as any).updateTaskStatus(
      currentUser,
      itTask.id,
      {
        status: TaskStatus.DONE,
      }
    );

    expect(updated.status).toBe(TaskStatus.DONE);
  });

  // ---------------------------------------------------------------------------
  // VIEWER behavior
  // ---------------------------------------------------------------------------

  it('VIEWER can update tasks inside their own organization', async () => {
    const itViewer = await usersRepo.findOneOrFail({
      where: { email: 'it.viewer@demo.com' },
      relations: ['organization'],
    });

    const currentUser = makeCurrentUser(
      itViewer.id,
      itViewer.email,
      itViewer.role,
      itViewer.organization.id
    );

    const itTask = await tasksRepo.findOneOrFail({
      where: { title: 'IT Task 1' },
      relations: ['organization'],
    });

    const updated = await (tasksService as any).updateTaskStatus(
      currentUser,
      itTask.id,
      {
        status: TaskStatus.IN_PROGRESS,
      }
    );

    expect(updated.status).toBe(TaskStatus.IN_PROGRESS);
    expect(updated.organization.id).toBe(currentUser.orgId); // sanity: same org
  });

 it('VIEWER cannot update tasks that are not assigned to them', async () => {
  // IT viewer (org = IT)
  const itViewer = await usersRepo.findOneOrFail({
    where: { email: 'it.viewer@demo.com' },
    relations: ['organization'],
  });
  const currentUser = makeCurrentUser(
    itViewer.id,
    itViewer.email,
    itViewer.role,
    itViewer.organization.id
  );

  // HR task, assigned to HR viewer (not this IT viewer)
  const hrTask = await tasksRepo.findOneOrFail({
    where: { title: 'HR Task 1' },
    relations: ['organization', 'assignee'],
  });

  await expect(
    (tasksService as any).updateTaskStatus(currentUser, hrTask.id, {
      status: TaskStatus.IN_PROGRESS,
    })
  ).rejects.toThrow('You can only update status for tasks assigned to you');
});


  it('VIEWER should not be allowed to create tasks', async () => {
    const itViewer = await usersRepo.findOneOrFail({
      where: { email: 'it.viewer@demo.com' },
      relations: ['organization'],
    });
    const currentUser = makeCurrentUser(
      itViewer.id,
      itViewer.email,
      itViewer.role,
      itViewer.organization.id
    );

    await expect(
      tasksService.createTask(currentUser, {
        title: 'Should fail',
        description: 'Viewer cannot create',
        category: 'Work',
      })
    ).rejects.toThrow('VIEWER cannot create tasks');
  });
});

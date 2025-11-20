import { TasksComponent } from './tasks.component';
import { AuthService, CurrentUser } from '../../core/auth.service';

describe('TasksComponent RBAC helpers', () => {
  const makeAuthService = (role: string, userId = 1): Partial<AuthService> => ({
    currentUser: {
      userId,
      email: 'user@demo.com',
      role,
      orgId: 1,
    } as CurrentUser,
  });

  const sampleTask = (overrides: any = {}) => ({
    id: 1,
    title: 'Test Task',
    description: 'desc',
    status: 'OPEN',
    category: 'Work',
    createdBy: { id: 1, email: 'creator@demo.com', name: 'Creator' },
    assignee: { id: 2, email: 'assignee@demo.com', name: 'Assignee' },
    ...overrides,
  });

  it('ADMIN can manage and delete any task', () => {
    const comp = new TasksComponent({} as any, makeAuthService('ADMIN') as any);
    const t = sampleTask();

    expect(comp.canManageTasks()).toBe(true);
    expect(comp.canManageThisTask(t)).toBe(true);
    expect(comp.canChangeStatus(t)).toBe(true);
    expect(comp.canDeleteTask(t)).toBe(true);
  });

  it('OWNER can manage and delete tasks', () => {
    const comp = new TasksComponent({} as any, makeAuthService('OWNER') as any);
    const t = sampleTask();

    expect(comp.canManageTasks()).toBe(true);
    expect(comp.canManageThisTask(t)).toBe(true);
    expect(comp.canDeleteTask(t)).toBe(true);
  });

  it('VIEWER can only change status of tasks assigned to them', () => {
    const comp = new TasksComponent(
      {} as any,
      makeAuthService('VIEWER', 5) as any
    );

    const assignedToMe = sampleTask({
      assignee: { id: 5, email: 'me@demo.com', name: 'Me' },
    });

    const assignedToOther = sampleTask({
      assignee: { id: 99, email: 'other@demo.com', name: 'Other' },
    });

    expect(comp.canManageTasks()).toBe(false);
    expect(comp.canDeleteTask(assignedToMe)).toBe(false);

    expect(comp.canChangeStatus(assignedToMe)).toBe(true);
    expect(comp.canChangeStatus(assignedToOther)).toBe(false);
  });
});

// apps/api/src/app/entities/task.entity.ts
import { TaskStatus } from '../../../../../libs/data/src/lib/task-status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { OrganizationEntity } from './organization.entity';

/**
 * Task entity.
 * Represents a single task within an organization, including
 * creator, optional assignee, category, and current status.
 */
@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  /**
   * Task status: OPEN, IN_PROGRESS, DONE.
   * Defaults to OPEN.
   */
  @Column({
    type: 'text',
    default: TaskStatus.OPEN,
  })
  status!: TaskStatus;

  /**
   * Optional category label such as "Work", "Personal", etc.
   */
  @Column({ nullable: true })
  category?: string | null;

  /**
   * User who created the task.
   */
  @ManyToOne(() => UserEntity, (user) => user.createdTasks, {
    nullable: false,
  })
  createdBy!: UserEntity;

  /**
   * Optional assignee responsible for completing the task.
   */
  @ManyToOne(() => UserEntity, (user) => user.assignedTasks, {
    nullable: true,
  })
  assignee?: UserEntity | null;

  /**
   * Organization under which this task exists.
   * All tasks belong to exactly one organization.
   */
  @ManyToOne(() => OrganizationEntity, { nullable: false })
  organization!: OrganizationEntity;
}

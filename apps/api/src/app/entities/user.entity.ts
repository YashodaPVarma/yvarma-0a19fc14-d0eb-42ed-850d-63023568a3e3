// apps/api/src/app/entities/user.entity.ts
import { UserRole } from '../../../../../libs/data/src/lib/user-role.enum';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { TaskEntity } from './task.entity';

/**
 * User entity.
 * Represents an application user with role-based access control
 * and relationships to tasks they create or are assigned to.
 */
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  // Hashed password stored using bcrypt
  @Column()
  passwordHash!: string;

  /**
   * User role drives access control (ADMIN, OWNER, VIEWER).
   * Defaults to VIEWER.
   */
  @Column({
    type: 'text',
    default: UserRole.VIEWER,
  })
  role!: UserRole;

  /**
   * Each user belongs to exactly one organization.
   */
  @ManyToOne(() => OrganizationEntity, { nullable: false })
  organization!: OrganizationEntity;

  /**
   * Tasks created by this user.
   */
  @OneToMany(() => TaskEntity, (task) => task.createdBy)
  createdTasks!: TaskEntity[];

  /**
   * Tasks assigned to this user.
   */
  @OneToMany(() => TaskEntity, (task) => task.assignee)
  assignedTasks!: TaskEntity[];
}

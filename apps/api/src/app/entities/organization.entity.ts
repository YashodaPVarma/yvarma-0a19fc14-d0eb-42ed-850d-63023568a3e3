// apps/api/src/app/entities/organization.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

/**
 * Organization entity.
 * Represents a simple two-level org hierarchy where an organization
 * may optionally have a parent and may contain child organizations.
 */
@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  /**
   * Optional parent organization.
   * Allows nesting such as: Company → Department.
   */
  @ManyToOne(() => OrganizationEntity, (org) => org.children, {
    nullable: true,
  })
  parent?: OrganizationEntity | null;

  /**
   * Child organizations belonging to this organization.
   */
  @OneToMany(() => OrganizationEntity, (org) => org.parent)
  children!: OrganizationEntity[];
}

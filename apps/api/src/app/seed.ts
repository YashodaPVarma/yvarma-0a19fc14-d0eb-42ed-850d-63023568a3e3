// apps/api/src/app/seed.ts
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { OrganizationEntity } from './entities/organization.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../../../libs/data/src/lib/user-role.enum';

/** Seed initial organizations and users if database is empty. */
export async function seedDatabase(dataSource: DataSource) {
  console.log('Checking if DB needs seeding...');

  const userRepo = dataSource.getRepository(UserEntity);
  const orgRepo = dataSource.getRepository(OrganizationEntity);

  const userCount = await userRepo.count();
  if (userCount > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Seeding database...');

  // --- Organizations --------------------------------------------------------

  const headOffice = orgRepo.create({ name: 'Head Office', parent: null });
  await orgRepo.save(headOffice);

  const itDept = orgRepo.create({ name: 'IT Department', parent: headOffice });
  await orgRepo.save(itDept);

  const hrDept = orgRepo.create({ name: 'HR Department', parent: headOffice });
  await orgRepo.save(hrDept);

  // --- Users ----------------------------------------------------------------

  const hash = async (pwd: string) => await bcrypt.hash(pwd, 10);

  /** Admin covering all departments. */
  const admin = userRepo.create({
    email: 'admin@demo.com',
    name: 'Admin User',
    passwordHash: await hash('admin123'),
    role: UserRole.ADMIN,
    organization: headOffice,
  });
  await userRepo.save(admin);

  /** IT department owner. */
  const itOwner = userRepo.create({
    email: 'it.owner@demo.com',
    name: 'IT Owner',
    passwordHash: await hash('owner123'),
    role: UserRole.OWNER,
    organization: itDept,
  });
  await userRepo.save(itOwner);

  /** IT department viewer. */
  const itViewer = userRepo.create({
    email: 'it.viewer@demo.com',
    name: 'IT Viewer',
    passwordHash: await hash('viewer123'),
    role: UserRole.VIEWER,
    organization: itDept,
  });
  await userRepo.save(itViewer);

  /** HR department owner. */
  const hrOwner = userRepo.create({
    email: 'hr.owner@demo.com',
    name: 'HR Owner',
    passwordHash: await hash('owner123'),
    role: UserRole.OWNER,
    organization: hrDept,
  });
  await userRepo.save(hrOwner);

  /** HR department viewer. */
  const hrViewer = userRepo.create({
    email: 'hr.viewer@demo.com',
    name: 'HR Viewer',
    passwordHash: await hash('viewer123'),
    role: UserRole.VIEWER,
    organization: hrDept,
  });
  await userRepo.save(hrViewer);

  console.log('🌳 Database seeded successfully!');
}

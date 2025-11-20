// libs/data/src/lib/current-user.interface.ts
import { UserRole } from './user-role.enum';

export interface CurrentUser {
  userId: number;
  email: string;
  role: UserRole | string;
  orgId: number;
}

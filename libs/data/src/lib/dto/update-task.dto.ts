// apps/api/src/app/tasks/dto/update-task.dto.ts
// import { TaskStatus } from '../../entities/task.entity';
import { TaskStatus } from '../task-status.enum';

export class UpdateTaskDto {
  title?: string;
  description?: string;
  category?: string;
  status?: TaskStatus;
  assigneeId?: number;
}

// apps/api/src/app/tasks/dto/update-task-status.dto.ts
// import { TaskStatus } from '../../entities/task.entity';
import { TaskStatus } from '../../../../../libs/data/src/lib/task-status.enum';

export class UpdateTaskStatusDto {
  status!: TaskStatus;
}

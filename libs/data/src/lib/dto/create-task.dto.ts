// apps/api/src/app/tasks/dto/create-task.dto.ts
export class CreateTaskDto {
  title!: string;
  description?: string;
  category?: string;   // "Work", "Personal", etc.
  assigneeId?: number; // optional: assign to a user in same org
}

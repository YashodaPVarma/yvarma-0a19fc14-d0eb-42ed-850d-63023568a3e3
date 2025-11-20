// apps/dashboard/src/app/features/tasks/tasks.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

/**
 * Lightweight user projection used for task creator/assignee display.
 */
interface UserSummary {
  id: number;
  email: string;
  name: string;
}

/**
 * Task model as returned by the API and used by the UI.
 */
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  category?: string;
  createdBy?: UserSummary;
  assignee?: UserSummary | null;
}

/**
 * Form backing model for create/edit operations.
 * Kept separate from Task so we can control which fields are sent back.
 */
interface TaskFormModel {
  id?: number;
  title: string;
  description: string;
  category: string;
  assigneeId?: number | null;
  status: string;
}

type SortColumn =
  | 'id'
  | 'title'
  | 'description'
  | 'status'
  | 'category'
  | 'assignee'
  | 'createdBy';

/**
 * Main tasks page: handles loading, filtering, sorting, drag & drop,
 * and RBAC-aware actions for TurboVets task management.
 */
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  originalTasks: Task[] = [];

  loading = false;
  error: string | null = null;

  // filters
  searchText = '';
  statusFilter: string = 'ALL';
  categoryFilter: string = 'ALL';

  // sorting
  sortColumn: SortColumn = 'title';
  sortDirection: 'asc' | 'desc' = 'asc';

  // form state
  form: TaskFormModel | null = null;
  showForm = false;
  isEditing = false;

  // theme
  theme: 'light' | 'dark' = 'light';

  // task stats for visualization
  taskStats = {
    total: 0,
    open: 0,
    inProgress: 0,
    done: 0,
  };

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Initialize theme and load initial task data.
   */
  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.theme = savedTheme;
    }
    this.fetchTasks();
  }

  // ---------------------------------------------------------------------------
  // Auth helpers
  // ---------------------------------------------------------------------------

  /**
   * Convenience wrapper around the AuthService current user.
   */
  get currentUser() {
    return this.auth.currentUser;
  }

  /**
   * Current user's role (ADMIN, OWNER, VIEWER, etc.).
   */
  get role(): string | undefined {
    return this.currentUser?.role;
  }

  /**
   * Normalized current user id (supports both userId and id shapes).
   */
  get currentUserId(): number | undefined {
    const u: any = this.currentUser;
    return u?.userId ?? u?.id;
  }

  // ---------------------------------------------------------------------------
  // API / data loading
  // ---------------------------------------------------------------------------

  /**
   * Load tasks from the API and refresh local state (list + stats + filters).
   */
  fetchTasks() {
    this.loading = true;
    this.error = null;

    this.http.get<Task[]>(`${this.apiUrl}/tasks`).subscribe({
      next: (tasks) => {
        this.originalTasks = tasks;
        this.updateTaskStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tasks', err);
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
      },
    });
  }

  /**
   * Manual refresh entry point for the UI.
   */
  refresh() {
    this.fetchTasks();
  }

  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------

  /**
   * Toggle between light and dark themes and persist preference.
   */
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
  }

  // ---------------------------------------------------------------------------
  // Task stats (for bar chart)
  // ---------------------------------------------------------------------------

  /**
   * Recalculate aggregated task stats from the full task list.
   */
  private updateTaskStats() {
    const all = this.originalTasks;
    const total = all.length;
    const open = all.filter((t) => t.status === 'OPEN').length;
    const inProgress = all.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = all.filter((t) => t.status === 'DONE').length;

    this.taskStats = {
      total,
      open,
      inProgress,
      done,
    };
  }

  /**
   * Helper to compute percentage for a given count based on total tasks.
   */
  getPercentage(count: number): number {
    if (!this.taskStats.total) return 0;
    return Math.round((count / this.taskStats.total) * 100);
  }

  // ---------------------------------------------------------------------------
  // RBAC helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns true if the current user can create/edit tasks.
   */
  canManageTasks(): boolean {
    return this.role === 'ADMIN' || this.role === 'OWNER';
  }

  /**
   * Placeholder for per-task management logic.
   * Currently OWNER/ADMIN can manage any task.
   */
  canManageThisTask(t: Task): boolean {
    if (this.role === 'ADMIN') return true;
    if (this.role === 'OWNER') return true;
    return false;
  }

  /**
   * Returns true if the current user is allowed to change the status of a task.
   */
  canChangeStatus(t: Task): boolean {
    if (!this.currentUser) return false;

    if (this.role === 'ADMIN') return true;
    if (this.role === 'OWNER') return true;

    if (this.role === 'VIEWER') {
      return !!t.assignee && t.assignee.id === this.currentUserId;
    }

    return false;
  }

  /**
   * Returns true if the current user can delete a task.
   */
  canDeleteTask(t: Task): boolean {
    if (this.role === 'ADMIN') return true;
    if (this.role === 'OWNER') return true;
    return false;
  }

  /**
   * Check if the task is assigned to the current user.
   */
  isAssignedToCurrentUser(task: Task): boolean {
    return (
      !!this.currentUser &&
      !!task.assignee &&
      task.assignee.id === this.currentUserId
    );
  }

  /**
   * Check if the task was created by the current user.
   */
  isCreatedByCurrentUser(task: Task): boolean {
    return (
      !!this.currentUser &&
      !!task.createdBy &&
      task.createdBy.id === this.currentUserId
    );
  }

  // ---------------------------------------------------------------------------
  // CRUD actions
  // ---------------------------------------------------------------------------

  /**
   * Map a status value to a Tailwind class string for display-only use.
   */
  getStatusClasses(status: string) {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DONE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  /**
   * Update task status via API and reload list on success.
   */
  updateStatus(taskId: number, status: string) {
    this.http
      .patch(`${this.apiUrl}/tasks/${taskId}/status`, { status })
      .subscribe({
        next: () => this.fetchTasks(),
        error: (err) => console.error('Failed to update status', err),
      });
  }

  /**
   * Delete task after user confirmation and reload list.
   */
  deleteTask(taskId: number) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.http.delete(`${this.apiUrl}/tasks/${taskId}`).subscribe({
      next: () => this.fetchTasks(),
      error: (err) => console.error('Failed to delete task', err),
    });
  }

  /**
   * Initialize form for creating a new task.
   */
  openCreateForm() {
    if (!this.canManageTasks()) return;

    this.isEditing = false;
    this.showForm = true;
    this.form = {
      title: '',
      description: '',
      category: 'Work',
      assigneeId: undefined,
      status: 'OPEN',
    };
  }

  /**
   * Initialize form for editing an existing task.
   */
  openEditForm(task: Task) {
    if (!this.canManageTasks()) return;

    this.isEditing = true;
    this.showForm = true;
    this.form = {
      id: task.id,
      title: task.title,
      description: task.description ?? '',
      category: task.category ?? '',
      assigneeId: task.assignee ? task.assignee.id : undefined,
      status: task.status,
    };
  }

  /**
   * Reset form state and hide the modal/panel.
   */
  cancelForm() {
    this.showForm = false;
    this.form = null;
    this.isEditing = false;
  }

  /**
   * Build DTO from form model and send create/update request.
   */
  submitForm() {
    if (!this.form) return;

    const dto: any = {
      title: this.form.title,
      description: this.form.description || null,
      category: this.form.category || null,
      assigneeId:
        this.form.assigneeId === undefined || this.form.assigneeId === null
          ? null
          : this.form.assigneeId,
    };

    if (this.isEditing) {
      dto.status = this.form.status;
    }

    const req$ =
      this.isEditing && this.form.id
        ? this.http.put(`${this.apiUrl}/tasks/${this.form.id}`, dto)
        : this.http.post(`${this.apiUrl}/tasks`, dto);

    req$.subscribe({
      next: () => {
        this.cancelForm();
        this.fetchTasks();
      },
      error: (err) => {
        console.error('Failed to save task', err);
        alert('Failed to save task. Please check the fields and try again.');
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Drag & drop
  // ---------------------------------------------------------------------------

  /**
   * Local-only drag & drop handler. Updates client-side order only.
   */
  drop(event: CdkDragDrop<Task[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
  }

  // ---------------------------------------------------------------------------
  // Filters & sorting
  // ---------------------------------------------------------------------------

  /**
   * Update sorting column/direction and re-apply sorting.
   */
  sortTasks(column: SortColumn) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting();
  }

  /**
   * Extract comparable value for a given task/column pair.
   */
  private getSortValue(task: Task, column: SortColumn): string | number {
    switch (column) {
      case 'id':
        return task.id;
      case 'title':
        return task.title || '';
      case 'description':
        return task.description || '';
      case 'category':
        return task.category || '';
      case 'status': {
        const order: Record<string, number> = {
          OPEN: 0,
          IN_PROGRESS: 1,
          DONE: 2,
        };
        return order[task.status] ?? 99;
      }
      case 'assignee':
        return task.assignee?.name || task.assignee?.email || '';
      case 'createdBy':
        return task.createdBy?.name || task.createdBy?.email || '';
      default:
        return '';
    }
  }

  /**
   * Apply search, status and category filters, then sort the results.
   */
  applyFilters() {
    let filtered = [...this.originalTasks];

    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.status === this.statusFilter);
    }

    if (this.categoryFilter !== 'ALL') {
      filtered = filtered.filter((t) => {
        const cat = (t.category || '').toLowerCase();
        const selected = this.categoryFilter.toLowerCase();
        return cat === selected;
      });
    }

    const term = this.searchText.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((t) => {
        const title = (t.title || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const assigneeName = (t.assignee?.name || '').toLowerCase();
        const assigneeEmail = (t.assignee?.email || '').toLowerCase();
        const createdName = (t.createdBy?.name || '').toLowerCase();
        const createdEmail = (t.createdBy?.email || '').toLowerCase();

        return (
          title.includes(term) ||
          desc.includes(term) ||
          assigneeName.includes(term) ||
          assigneeEmail.includes(term) ||
          createdName.includes(term) ||
          createdEmail.includes(term)
        );
      });
    }

    this.tasks = filtered;
    this.applySorting();
  }

  /**
   * Sort current tasks array using the active column/direction.
   */
  applySorting() {
    this.tasks = [...this.tasks].sort((a, b) => {
      const valueA = this.getSortValue(a, this.sortColumn);
      const valueB = this.getSortValue(b, this.sortColumn);

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      const vA = String(valueA).toLowerCase();
      const vB = String(valueB).toLowerCase();

      if (vA < vB) return this.sortDirection === 'asc' ? -1 : 1;
      if (vA > vB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts (SMART MODE)
  // ---------------------------------------------------------------------------

  /**
   * Return true if the keyboard event originated from a text/editable field.
   * Used to avoid triggering shortcuts while the user is typing.
   */
  private isTypingInInput(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement | null;
    if (!target) return false;

    const tag = target.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      return true;
    }
    if ((target as any).isContentEditable) {
      return true;
    }
    return false;
  }

  /**
   * Global keyboard handler for shortcuts:
   * - Ctrl/Cmd+S: submit form (if open)
   * - Esc: close form
   * - N: open new task form (if allowed)
   */
  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    // smart mode: ignore shortcuts while typing in form fields
    if (this.isTypingInInput(event)) {
      return;
    }

    // Ctrl+S or Cmd+S -> submit form if open
    if (
      (event.key === 's' || event.key === 'S') &&
      (event.ctrlKey || event.metaKey)
    ) {
      if (this.showForm && this.form) {
        event.preventDefault();
        this.submitForm();
      }
      return;
    }

    // Esc -> close form if open
    if (event.key === 'Escape') {
      if (this.showForm) {
        event.preventDefault();
        this.cancelForm();
      }
      return;
    }

    // N -> new task (only if user can manage tasks)
    if (event.key === 'n' || event.key === 'N') {
      if (this.canManageTasks()) {
        event.preventDefault();
        this.openCreateForm();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  /**
   * Trigger logout via AuthService. Navigation is handled in the service.
   */
  onLogout() {
    this.auth.logout();
  }
}

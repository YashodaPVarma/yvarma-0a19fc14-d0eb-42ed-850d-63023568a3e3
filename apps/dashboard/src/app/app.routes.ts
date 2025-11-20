import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { TasksComponent } from './features/tasks/tasks.component';
import { AuthGuard } from './core/auth.guard';

/**
 * Application route definitions.
 * Protects the tasks area behind authentication and sends any unknown
 * paths back to the login screen.
 */
export const routes: Routes = [
  // Default route → redirect to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public route
  { path: 'login', component: LoginComponent },

  // Protected route (requires a valid session)
  { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },

  // Catch-all: redirect unknown paths
  { path: '**', redirectTo: 'login' },
];

// apps/dashboard/src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/auth.interceptor';

/**
 * Central application-level configuration for the Angular standalone app.
 * This replaces the traditional AppModule setup for providers.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Enable more efficient change detection by batching DOM events
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Register application routes
    provideRouter(routes),

    // Provide HttpClient with support for DI-based interceptors
    provideHttpClient(withInterceptorsFromDi()),

    // Global HTTP interceptor for attaching auth tokens
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

/**
 * Entry point for the Angular standalone application.
 * Bootstraps the root component using the application-level configuration.
 */
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

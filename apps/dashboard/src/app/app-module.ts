// apps/dashboard/src/app/app-module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app';
import { routes } from './app.routes';

/**
 * Root Angular module for the dashboard application.
 * Since AppComponent is standalone, it is added under "imports"
 * instead of the traditional "declarations" array.
 */
@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    AppComponent, // standalone root component
  ],
  declarations: [], // no traditional components declared here
  bootstrap: [AppComponent], // Application entry point
})
export class AppModule {}

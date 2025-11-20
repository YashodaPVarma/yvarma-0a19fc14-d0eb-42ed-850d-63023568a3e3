import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component for the dashboard application.
 * Since routing controls the entire UI, this component
 * simply hosts the router outlet.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}

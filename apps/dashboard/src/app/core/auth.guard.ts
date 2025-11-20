import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Route guard used to block access to pages that require authentication.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Runs before the route is activated.
   * If the user is not logged in, redirect them to the login page.
   */
  canActivate(): boolean | UrlTree {
    // Allow navigation only when the user has a valid session
    if (this.auth.isLoggedIn()) {
      return true;
    }

    // Redirect to login when not authenticated
    return this.router.parseUrl('/login');
  }
}

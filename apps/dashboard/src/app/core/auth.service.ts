import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface CurrentUser {
  userId: number;
  email: string;
  role: string;
  orgId: number;
}

/**
 * Handles authentication, session storage, and current-user state.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  // Holds the current logged-in user; null when logged out
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Restore session from localStorage on page refresh
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  /**
   * Sends login request and stores JWT + user info on success.
   */
  login(
    email: string,
    password: string
  ): Observable<{ access_token: string; user: CurrentUser }> {
    return this.http
      .post<{ access_token: string; user: CurrentUser }>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          // Persist token and user data for session continuity
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        })
      );
  }

  /**
   * Clears stored session and redirects to login page.
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Returns the JWT token from storage.
   */
  get token(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Returns the currently logged-in user.
   */
  get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Checks whether a valid session exists.
   */
  isLoggedIn(): boolean {
    return !!this.token;
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // Initialize form with default demo credentials
    this.form = this.fb.group({
      email: ['manager@demo.com', [Validators.required, Validators.email]],
      password: ['manager123', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // If a logged-in user returns to /login, clear their session
    if (this.auth.isLoggedIn()) {
      this.auth.logout();
    }
  }

  /**
   * Handles form submission and triggers the login request.
   */
  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    this.auth.login(this.form.value.email!, this.form.value.password!)
      .subscribe({
        next: (res) => {
          console.log("LOGIN SUCCESS:", res);
          this.loading = false;
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          console.error("LOGIN ERROR:", err);
          this.error = 'Login failed. Please check credentials.';
          this.loading = false;
        }
      });
  }
}

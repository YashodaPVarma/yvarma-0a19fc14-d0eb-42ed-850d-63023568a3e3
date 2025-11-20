import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      isLoggedIn: jest.fn().mockReturnValue(false),
      login: jest.fn(),
      logout: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent], // standalone component
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call auth.login and navigate to /tasks on successful submit', () => {
    authServiceMock.login.mockReturnValue(
      of({
        access_token: 'token',
        user: {
          userId: 1,
          email: 'admin@demo.com',
          role: 'ADMIN',
          orgId: 1,
        },
      })
    );

    component.form.setValue({
      email: 'admin@demo.com',
      password: 'admin123',
    });

    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledWith(
      'admin@demo.com',
      'admin123'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should set error message when login fails', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => new Error('Invalid credentials'))
    );

    component.form.setValue({
      email: 'admin@demo.com',
      password: 'wrong',
    });

    component.submit();

    expect(component.error).toBe('Login failed. Please check credentials.');
    expect(component.loading).toBe(false);
  });
});

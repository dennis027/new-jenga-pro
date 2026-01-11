import {
  Component,
  signal,
  inject,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  NgZone,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';
import { finalize } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  // 🔹 Reactive form
  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  // 🔹 UI state (signals)
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  // 🔹 Snackbar helpers
  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  // 🔹 Toggle password visibility
  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  // 🔹 Forgot password
  onForgotPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }

  // 🔹 Submit login
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService
      .login(this.loginForm.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.showSuccess('Logged in successfully!');
          this.router.navigate(['/main-menu']);
          this.cdr.detectChanges();
        },
        error: (err) => {
          const code = err?.error?.code;
          const message = err?.error?.message || 'Login failed. Please try again.';

          // 🔹 EMAIL_NOT_VERIFIED handling
          if (code === 'EMAIL_NOT_VERIFIED') {
            const email = err?.error?.email;
            if (!email) {
              this.showError('Your email is not verified. Please check your inbox.');
              return;
            }

            // Navigate to Email Verification page inside Angular zone
            this.zone.run(() => {
              this.router.navigate(['/email-verify'], {
                state: { email, code, message },
              });
            });

            return;
          }

          // 🔹 Default error handling
          this.showError('Check your credentials.');
          this.errorMessage.set(message);
        },
      });
  }

  ngOnInit() {}

  ngOnDestroy() {}
}

import {
  Component,
  signal,
  inject,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  // 🔹 Reactive signals
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // 🔹 FormGroup
  registerForm: FormGroup = this.fb.group(
    {
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required],
      account_type: ['01', Validators.required],
    },
    { validators: this.passwordsMatch }
  );

  // 🔹 Password match validator
  private passwordsMatch(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirm = control.get('confirm_password')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  // 🔹 Toggle password visibility
  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  // 🔹 SnackBar helpers
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

  // 🔹 Form submit
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService
      .register(this.registerForm.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.showSuccess('Account created successfully!');

          // Navigate to email verification page with email in state
          this.router.navigate(['/email-verify'], {
            state: {
              email: this.registerForm.value.email,
              from: 'register',
            },
          });

          this.cdr.detectChanges();
        },
        error: (err) => {
          const code = err?.error?.code;
          const message = err?.error?.message;
          // Handle backend errors gracefully

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

          const errorMsg = err?.error?.message || 'Registration failed. Try again.';
          this.showError(errorMsg);
        },
      });
  }
}

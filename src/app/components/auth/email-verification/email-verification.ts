import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './email-verification.html',
  styleUrls: ['./email-verification.css'],
})
export class EmailVerification implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  email = signal<string | null>(null);
  message = signal<string>('Please check your email to activate your account.');
  isError = signal(false);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      // If SSR, skip browser-only logic
      return;
    }

    const state = window.history.state as { email?: string; code?: string; message?: string };

    if (!state?.email) {
      this.router.navigate(['/login']);
      return;
    }

    this.email.set(state.email);

    if (state.code === 'EMAIL_NOT_VERIFIED') {
      this.isError.set(true);
      this.message.set(
        state.message || 'Your account is not verified. Please check your inbox or resend verification email.'
      );
    } else {
      this.isError.set(false);
      this.message.set(
        state.message || 'Please check your email to activate your account.'
      );
    }
  }

  goToLogin() {  
    this.router.navigate(['/login']);
  }

  resendEmail() {
    this.authService.resendActivationEmail(this.email()).subscribe({
      next: () => {
        this.isError.set(false);
        this.message.set('Verification email resent. Please check your inbox.');
      },
      error: (err) => {
        this.isError.set(true);
        this.message.set(
          err?.error?.message || 'Failed to resend verification email. Please try again later.'
        );
      },
    });

    
  }
}

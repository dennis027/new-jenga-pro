import {
  Component,
  signal,
  afterNextRender,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AppBarService } from '../../services/app-bar-service';
import { GigServices } from '../../services/gig-services';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token-service';

interface Gig {
  id: number;
  client_name: string;
  client_phone: string;
  ward: string;
  constituency: string;
  county: string;
  start_date: string;
  duration_value: number;
  duration_unit: string;
  is_verified: boolean;
}

@Component({
  selector: 'app-verify-gigs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-gigs.html',
  styleUrls: ['./verify-gigs.css'],
})
export class VerifyGigs implements OnInit, OnDestroy {
  // ✅ Signals for reactive state management
  isMobile = signal(false);
  isLoading = signal(false);
  unverifiedGigs = signal<Gig[]>([]);

  private appBar = inject(AppBarService);
  private gigService = inject(GigServices);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private tokenService = inject(TokenService);

  private isBrowser: boolean;
  private resizeHandler = () => this.checkScreen();

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      afterNextRender(() => {
        this.checkScreen();
        window.addEventListener('resize', this.resizeHandler);
      });
    }
  }

ngOnInit(): void {
  this.appBar.setTitle('Verify Gigs');
  this.appBar.setBack(true);

  if (isPlatformBrowser(this.platformId) && this.tokenService.isLoggedIn()) {
    this.getUnverifiedGigs();
  } else if (isPlatformBrowser(this.platformId)) {
    // Optionally redirect to login
    this.router.navigate(['/login']);
  }
}


  private checkScreen(): void {
    if (!this.isBrowser) return;
    this.isMobile.set(window.innerWidth < 992);
  }

  getUnverifiedGigs() {
    this.isLoading.set(true);
    this.gigService.getUnverifiedGigs().subscribe({
      next: (data) => {
        this.unverifiedGigs.set(data.filter((gig: Gig) => !gig.is_verified));
        this.isLoading.set(false);
        console.log('Unverified gigs fetched', data);
      },
      error: (err) => {
        console.error('Error fetching unverified gigs', err);
        this.isLoading.set(false);

      }
    });
  }

  verifyGig(gigId: number): void {
    this.gigService.verifyGig(gigId).subscribe({
      next: (response) => {
        console.log('Gig verified', response);
        // Remove the verified gig from the list
        this.unverifiedGigs.set(
          this.unverifiedGigs().filter(gig => gig.id !== gigId)
        );
      },
      error: (err) => {
        console.error('Error verifying gig', err);
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else if (err.status !== 0) {
          alert('Failed to verify gig. Please try again.');
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    this.appBar.clearActions();
  }
}
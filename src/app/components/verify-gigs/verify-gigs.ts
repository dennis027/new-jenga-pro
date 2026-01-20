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
import { Inject } from '@angular/core';

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

  // signals
  isMobile = signal(false);

  // services
  private appBar = inject(AppBarService);

  // platform
  private isBrowser: boolean;

  // state
  isLoading = false;
  unverifiedGigs: Gig[] = [];

  // keep reference so we can remove it
  private resizeHandler = () => this.checkScreen();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    // ✅ SAFE platform check
    this.isBrowser = isPlatformBrowser(platformId);

    // ✅ ONLY run browser logic in browser
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

    this.fetchUnverifiedGigs();
  }

  private checkScreen(): void {
    if (!this.isBrowser) return;
    this.isMobile.set(window.innerWidth < 992);
  }

  fetchUnverifiedGigs(): void {
    this.isLoading = true;

    // 🔧 MOCK DATA (replace with API later)
    this.unverifiedGigs = [
      {
        id: 1,
        client_name: 'John Mwangi',
        client_phone: '+254 712 345 678',
        ward: 'Parklands',
        constituency: 'Westlands',
        county: 'Nairobi',
        start_date: '2026-01-15',
        duration_value: 3,
        duration_unit: 'days',
        is_verified: false,
      },
      {
        id: 2,
        client_name: 'Mary Njeri',
        client_phone: '+254 723 456 789',
        ward: 'Kilimani',
        constituency: 'Dagoretti North',
        county: 'Nairobi',
        start_date: '2026-01-16',
        duration_value: 5,
        duration_unit: 'days',
        is_verified: false,
      },
      {
        id: 3,
        client_name: 'Peter Omondi',
        client_phone: '+254 734 567 890',
        ward: 'Karen',
        constituency: 'Langata',
        county: 'Nairobi',
        start_date: '2026-01-18',
        duration_value: 1,
        duration_unit: 'week',
        is_verified: false,
      },
    ];

    this.isLoading = false;
  }

  verifyGig(gigId: number): void {
    this.unverifiedGigs = this.unverifiedGigs.filter(
      gig => gig.id !== gigId
    );

    console.log(`Gig ${gigId} verified`);
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    this.appBar.clearActions();
  }
}

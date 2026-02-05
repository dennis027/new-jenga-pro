import { Component, signal, afterNextRender, inject, OnInit, OnDestroy, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AppBarService } from '../../services/app-bar-service';
import { UserService } from '../../services/user-service';
import { TokenService } from '../../services/token-service';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

interface Gig {
  id: number;
  workerName: string;
  siteName: string;
  jobType: string;
  date: string;
  verified: boolean;
}

interface WeeklyData {
  day: string;
  gigs: number;
  date?: string;
}

interface Site {
  id: number;
  name: string;
  workers: number;
  gigs: number;
  completion: number;
}

interface Worker {
  id: number;
  rank: number;
  name: string;
  avatar: string;
  gigs: number;
  rating: number;
}

interface CalendarDay {
  date: string;
  dayName: string;
  dayNum: number;
  gigs: number;
}

interface DashboardStats {
  total_gigs: number;
  unverified_gigs: number;
  active_workers: number;
  active_sites: number;
  verified_this_week: number;
  verification_rate: number;
  avg_verification_time: number;
}

@Component({
  selector: 'app-supervisor-dash',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './jenga-dash.html',
  styleUrl: './jenga-dash.css',
})
export class JengaDash implements OnInit, OnDestroy {
  @ViewChild('accountMenuTrigger') accountMenuTrigger!: MatMenuTrigger;
  
  isMobile = signal(false);
  isLoading = signal(true);
  
  private appBar = inject(AppBarService);
  private router = inject(Router);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  private tokenService = inject(TokenService);

  // User data
  username = signal<string>('');
  email = signal<string>('');
  fullname = signal<string>('');
  imgFile = signal<string>('');
  
  // Stats (now from API)
  totalGigs = signal<number>(0);
  unverifiedGigs = signal<number>(0);
  activeWorkers = signal<number>(0);
  activeSites = signal<number>(0);
  
  // Analytics data (from API)
  verifiedThisWeek = signal<number>(0);
  verificationRate = signal<number>(0);
  avgVerificationTime = signal<number>(0);

  // Mobile calendar - last 7 days (from API)
  last7Days = signal<CalendarDay[]>([]);

  // Recent gigs (from API) - WITH PAGINATION
  private allRecentGigs = signal<Gig[]>([]);
  recentGigs = signal<Gig[]>([]);
  showAllRecentGigs = signal<boolean>(false);
  private readonly GIGS_LIMIT = 5;

  // Weekly chart data (from API)
  weeklyData = signal<WeeklyData[]>([]);
  maxWeeklyGigs = signal<number>(0);

  // Top sites (from API) - WITH PAGINATION
  private allTopSites = signal<Site[]>([]);
  topSites = signal<Site[]>([]);
  showAllTopSites = signal<boolean>(false);
  private readonly SITES_LIMIT = 5;

  // Top workers (from API) - WITH PAGINATION
  private allTopWorkers = signal<Worker[]>([]);
  topWorkers = signal<Worker[]>([]);
  showAllTopWorkers = signal<boolean>(false);
  private readonly WORKERS_LIMIT = 5;

  constructor() {
    afterNextRender(() => {
      this.checkScreen();
      window.addEventListener('resize', () => this.checkScreen());
    });
  }

  private checkScreen(): void {
    this.isMobile.set(window.innerWidth < 992);
  }

  ngOnInit(): void {
    this.appBar.setTitle('Jenga Pro');
    this.appBar.setBack(false);

    this.appBar.setActions([
      {
        id: 'account',
        icon: 'account_circle',
        ariaLabel: 'Account',
        onClick: () => {
          setTimeout(() => this.accountMenuTrigger?.openMenu(), 0);
        },
      },
    ]);
    
    // Browser-only logic
    if (isPlatformBrowser(this.platformId)) {
      if (this.tokenService.isLoggedIn()) {
        this.loadDashboardData();
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  /**
   * Load all dashboard data from API
   */
  private loadDashboardData(): void {
    this.isLoading.set(true);

    // Load all data in parallel using forkJoin
    forkJoin({
      userProfile: this.userService.getUserDetails(),
      dashboardStats: this.userService.jengaStart(),
      recentGigs: this.userService.recentGigs(),
      topSites: this.userService.topSites(),
      topWorkers: this.userService.topWorkers(),
      calendar: this.userService.calendar()
    }).subscribe({
      next: (results) => {
        console.log('Dashboard data loaded:', results);

        // Set user data
        this.username.set(results.userProfile.username || '');
        this.fullname.set(results.userProfile.full_name || '');
        this.email.set(results.userProfile.email || '');
        
        // Handle profile image
        if (results.userProfile.profile_pic) {
          this.imgFile.set(`${environment.apiUrl}${results.userProfile.profile_pic}`);
        }

        // Set dashboard stats
        const stats = results.dashboardStats as DashboardStats;
        this.totalGigs.set(stats.total_gigs);
        this.unverifiedGigs.set(stats.unverified_gigs);
        this.activeWorkers.set(stats.active_workers);
        this.activeSites.set(stats.active_sites);
        this.verifiedThisWeek.set(stats.verified_this_week);
        this.verificationRate.set(stats.verification_rate);
        this.avgVerificationTime.set(stats.avg_verification_time);

        // Set recent gigs with pagination
        this.allRecentGigs.set(results.recentGigs);
        this.updateRecentGigsDisplay();

        // Set top sites with pagination
        this.allTopSites.set(results.topSites);
        this.updateTopSitesDisplay();

        // Set top workers with pagination
        this.allTopWorkers.set(results.topWorkers);
        this.updateTopWorkersDisplay();

        // Set calendar data
        this.last7Days.set(results.calendar);

        // Generate weekly chart data from calendar
        this.generateWeeklyChart(results.calendar);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading.set(false);
        
        if (err.status === 401) {
          console.error('Unauthorized - redirecting to login');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /**
   * Update recent gigs display based on show all state
   */
  private updateRecentGigsDisplay(): void {
    const allGigs = this.allRecentGigs();
    if (this.showAllRecentGigs()) {
      this.recentGigs.set(allGigs);
    } else {
      this.recentGigs.set(allGigs.slice(0, this.GIGS_LIMIT));
    }
  }

  /**
   * Toggle show all recent gigs
   */
  toggleRecentGigs(): void {
    this.showAllRecentGigs.set(!this.showAllRecentGigs());
    this.updateRecentGigsDisplay();
  }

  /**
   * Update top sites display based on show all state
   */
  private updateTopSitesDisplay(): void {
    const allSites = this.allTopSites();
    if (this.showAllTopSites()) {
      this.topSites.set(allSites);
    } else {
      this.topSites.set(allSites.slice(0, this.SITES_LIMIT));
    }
  }

  /**
   * Toggle show all top sites
   */
  toggleTopSites(): void {
    this.showAllTopSites.set(!this.showAllTopSites());
    this.updateTopSitesDisplay();
  }

  /**
   * Update top workers display based on show all state
   */
  private updateTopWorkersDisplay(): void {
    const allWorkers = this.allTopWorkers();
    if (this.showAllTopWorkers()) {
      this.topWorkers.set(allWorkers);
    } else {
      this.topWorkers.set(allWorkers.slice(0, this.WORKERS_LIMIT));
    }
  }

  /**
   * Toggle show all top workers
   */
  toggleTopWorkers(): void {
    this.showAllTopWorkers.set(!this.showAllTopWorkers());
    this.updateTopWorkersDisplay();
  }

  /**
   * Check if there are more recent gigs to show
   */
  hasMoreRecentGigs(): boolean {
    return this.allRecentGigs().length > this.GIGS_LIMIT;
  }

  /**
   * Check if there are more top sites to show
   */
  hasMoreTopSites(): boolean {
    return this.allTopSites().length > this.SITES_LIMIT;
  }

  /**
   * Check if there are more top workers to show
   */
  hasMoreTopWorkers(): boolean {
    return this.allTopWorkers().length > this.WORKERS_LIMIT;
  }

  /**
   * Generate weekly chart data from calendar response
   */
  private generateWeeklyChart(calendar: CalendarDay[]): void {
    if (!calendar || calendar.length === 0) return;

    const weeklyData = calendar.map(day => ({
      day: day.dayName,
      gigs: day.gigs,
      date: day.date
    }));

    this.weeklyData.set(weeklyData);
    
    // Calculate max for chart scaling
    const maxGigs = Math.max(...weeklyData.map(d => d.gigs), 1);
    this.maxWeeklyGigs.set(maxGigs);
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  goToProfile(): void {
    this.router.navigate(['/main-menu/update-profile']);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.appBar.clearActions();
  }
}
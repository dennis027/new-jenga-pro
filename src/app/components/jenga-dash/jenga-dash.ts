
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
  date: Date;
  dayName: string;
  dayNum: number;
  gigs: number;
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
export class JengaDash {
  @ViewChild('accountMenuTrigger') accountMenuTrigger!: MatMenuTrigger;
  
  isMobile = signal(false);
  private appBar = inject(AppBarService);
  private router = inject(Router);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  private tokenService = inject(TokenService);

  // User data
  username: string = '';
  email: string = 'james.k@example.com';
  fullname: string = 'James Kiprotich';
  imgFile: string = '';
  
  // Stats
  totalGigs: number = 24;
  unverifiedGigs: number = 5;
  activeWorkers: number = 12;
  activeSites: number = 3;
  
  // Analytics data
  verifiedThisWeek: number = 18;
  verificationRate: number = 92;
  avgVerificationTime: number = 4;
  
  // API URLs
  apiUrl: string = '';
  imgUrl: string = '';

  // Mobile calendar - last 7 days
  last7Days: CalendarDay[] = [];

  // Recent gigs
  recentGigs: Gig[] = [
    {
      id: 1,
      workerName: 'John Mwangi',
      siteName: 'Westlands Construction',
      jobType: 'Plumbing',
      date: 'Jan 11, 2026',
      verified: true
    },
    {
      id: 2,
      workerName: 'Mary Njeri',
      siteName: 'Kilimani Apartments',
      jobType: 'Electrical',
      date: 'Jan 10, 2026',
      verified: false
    },
    {
      id: 3,
      workerName: 'Peter Omondi',
      siteName: 'Karen Residential',
      jobType: 'Carpentry',
      date: 'Jan 10, 2026',
      verified: true
    },
    {
      id: 4,
      workerName: 'Jane Akinyi',
      siteName: 'Westlands Construction',
      jobType: 'Painting',
      date: 'Jan 9, 2026',
      verified: true
    }
  ];

  // Weekly chart data
  weeklyData: WeeklyData[] = [
    { day: 'Mon', gigs: 4 },
    { day: 'Tue', gigs: 6 },
    { day: 'Wed', gigs: 5 },
    { day: 'Thu', gigs: 8 },
    { day: 'Fri', gigs: 7 },
    { day: 'Sat', gigs: 3 },
    { day: 'Sun', gigs: 2 }
  ];

  maxWeeklyGigs: number = 8;

  // Top sites
  topSites: Site[] = [
    { id: 1, name: 'Westlands Construction', workers: 8, gigs: 45, completion: 75 },
    { id: 2, name: 'Kilimani Apartments', workers: 5, gigs: 32, completion: 60 },
    { id: 3, name: 'Karen Residential', workers: 4, gigs: 28, completion: 85 }
  ];

  // Top workers
  topWorkers: Worker[] = [
    { id: 1, rank: 1, name: 'John Mwangi', avatar: '', gigs: 12, rating: 4.8 },
    { id: 2, rank: 2, name: 'Mary Njeri', avatar: '', gigs: 10, rating: 4.7 },
    { id: 3, rank: 3, name: 'Peter Omondi', avatar: '', gigs: 9, rating: 4.6 },
    { id: 4, rank: 4, name: 'Jane Akinyi', avatar: '', gigs: 8, rating: 4.5 }
  ];

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
          setTimeout(() => {
            this.accountMenuTrigger?.openMenu();
          }, 0);
        },
      },
    ]);

    this.generateLast7Days();
    this.fetchSupervisorData();

    if (isPlatformBrowser(this.platformId) && this.tokenService.isLoggedIn()) {
      this.getLoggedInUser();
  } else if (isPlatformBrowser(this.platformId)) {
    // Optionally redirect to login
    this.router.navigate(['/login']);
  }
  }

  getLoggedInUser(): void { 
    this.userService.getUserDetails().subscribe({
      next: (data) => {
        console.log('User profile data', data);
        this.username = data.username;
        this.fullname = data.full_name;
        this.email = data.email;
        this.imgFile = data.profile_image ? data.profile_image : '';
      },
      error: (err) => {
        console.error('Error fetching user profile', err);
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    }); 
  }

  // Generate last 7 days for mobile calendar
  private generateLast7Days(): void {
    const today = new Date();
    const calendar: CalendarDay[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Mock gig counts for each day
    const gigCounts = [2, 4, 3, 5, 6, 4, 0]; // Last 7 days
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      calendar.push({
        date: date,
        dayName: dayNames[date.getDay()],
        dayNum: date.getDate(),
        gigs: gigCounts[6 - i]
      });
    }
    
    this.last7Days = calendar;
  }

  async fetchSupervisorData(): Promise<void> {
    // TODO: Implement API calls
    // const token = localStorage.getItem('access_token');
    // Fetch user data and gigs from API
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
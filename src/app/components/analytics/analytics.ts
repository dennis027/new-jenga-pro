import { Component, inject, signal, afterNextRender, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics-service';
import { AppBarService } from '../../services/app-bar-service';
import { forkJoin } from 'rxjs';

interface SummaryStats {
  all_time: {
    total_gigs: number;
    verified_gigs: number;
    verification_rate: number;
    total_revenue: number;
    unique_workers: number;
  };
  last_7_days: {
    total_gigs: number;
    verified_gigs: number;
    total_revenue: number;
  };
  last_30_days: {
    total_gigs: number;
    verified_gigs: number;
    total_revenue: number;
  };
  top_performers: {
    top_worker: string;
    top_worker_gigs: number;
    top_organization: string;
    top_organization_gigs: number;
  };
}

interface GigTrend {
  period: string;
  total_gigs: number;
  verified_gigs: number;
  total_revenue: number;
  verification_rate: number;
}

interface WorkerPerformance {
  worker_id: number;
  worker_name: string;
  total_gigs: number;
  verified_gigs: number;
  verification_rate: number;
  total_earnings: number;
  credit_score: number;
}

interface JobTypeAnalytics {
  job_type: string;
  total_gigs: number;
  verified_gigs: number;
  total_revenue: number;
  verification_rate: number;
}

interface ComparativeData {
  current_period: {
    total_gigs: number;
    verified_gigs: number;
    total_revenue: number;
    unique_workers: number;
  };
  previous_period: {
    total_gigs: number;
    verified_gigs: number;
    total_revenue: number;
    unique_workers: number;
  };
  changes: {
    gigs_change: number;
    verified_change: number;
    revenue_change: number;
    workers_change: number;
  };
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private appBar = inject(AppBarService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isMobile = signal(false);
  isLoading = signal(true);
  activeTab = signal<'overview' | 'workers' | 'sites' | 'revenue'>('overview');

  // Summary data
  summaryStats = signal<SummaryStats | null>(null);
  
  // Trends data
  gigTrends = signal<GigTrend[]>([]);
  maxTrendValue = signal<number>(0);
  
  // Top performers
  topWorkers = signal<WorkerPerformance[]>([]);
  topJobTypes = signal<JobTypeAnalytics[]>([]);
  
  // Comparative data
  comparativeData = signal<ComparativeData | null>(null);

  constructor() {
    afterNextRender(() => {
      this.checkScreen();
      window.addEventListener('resize', () => this.checkScreen());
    });
  }

  private checkScreen(): void {
    this.isMobile.set(window.innerWidth < 992);
  }

  ngOnInit() {  
    this.appBar.setTitle('Analytics');
    this.appBar.setBack(true);

    if (isPlatformBrowser(this.platformId)) {
      this.loadAnalytics();
    }
  }

  /**
   * Load all analytics data
   */
  private loadAnalytics(): void {
    this.isLoading.set(true);

    forkJoin({
      summary: this.analyticsService.summary(),
      trends: this.analyticsService.gigTrends(),
      workers: this.analyticsService.workerPerformance(),
      jobTypes: this.analyticsService.jobTypes(),
      comparative: this.analyticsService.comparativeE()
    }).subscribe({
      next: (results) => {
        console.log('Analytics data loaded:', results);

        // Set summary stats
        this.summaryStats.set(results.summary);

        // Set trends (limit to 14 days for display)
        const trends = results.trends.trends || [];
        this.gigTrends.set(trends.slice(-14));
        
        // Calculate max value for chart scaling
        const maxGigs = Math.max(...trends.map((t: GigTrend) => t.total_gigs), 1);
        this.maxTrendValue.set(maxGigs);

        // Set top workers (limit to 5)
        this.topWorkers.set(results.workers.slice(0, 5));

        // Set top job types (limit to 5)
        this.topJobTypes.set(results.jobTypes.slice(0, 5));

        // Set comparative data
        this.comparativeData.set(results.comparative);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        this.isLoading.set(false);
        
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /**
   * Switch between tabs
   */
  setActiveTab(tab: 'overview' | 'workers' | 'sites' | 'revenue'): void {
    this.activeTab.set(tab);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  /**
   * Get change indicator class
   */
  getChangeClass(change: number): string {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Get change icon
   */
  getChangeIcon(change: number): string {
    if (change > 0) return 'trending_up';
    if (change < 0) return 'trending_down';
    return 'trending_flat';
  }

  /**
   * Refresh analytics data
   */
  refreshAnalytics(): void {
    this.loadAnalytics();
  }

  /**
   * Navigate to detailed view
   */
  viewDetails(type: string): void {
    // Navigate to detailed analytics pages
    console.log('View details for:', type);
  }
}
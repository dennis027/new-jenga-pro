import { Component, inject, OnInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppBarService } from '../../services/app-bar-service';
import { Router } from '@angular/router';

interface Gig {
  id: number;
  start_date: string;
  duration_value: number;
  duration_unit: string;
  client_name: string;
  client_phone: string;
  county: string;
  constituency: string;
  ward: string;
  amount_paid: string;
  is_verified: boolean;
  created_at: string;
  is_complete: boolean;
  worker: number;
  job_type: number;
  logged_by: number;
  verified_by: number | null;
  organization: number;
}

interface WorkerData {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  county: string;
  constituency: string;
  ward: string;
  is_verified: boolean;
  credit_score: number;
  gigs: Gig[];
  logged_gigs: Gig[];
}

@Component({
  selector: 'app-manage-workers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-workers.html',
  styleUrl: './manage-workers.css',
})
export class ManageWorkers implements OnInit, OnDestroy {
  private appBar = inject(AppBarService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  searchQuery: string = '';
  workerData: WorkerData | null = null;
  isLoading = false;
  activeTab: 'gigs' | 'logged' = 'gigs';

  // Demo data for multiple workers
  private demoWorkers: WorkerData[] = [
    {
      id: 2,
      username: "dennis027",
      full_name: "Dennis Kimani",
      email: "lewob61357@elafans.com",
      phone: "0712345678",
      county: "Lamu",
      constituency: "Lamu West",
      ward: "Hongwe",
      is_verified: true,
      credit_score: 10,
      gigs: [
        {
          id: 1,
          start_date: "2026-01-20",
          duration_value: 2,
          duration_unit: "weeks",
          client_name: "Dennis Mac",
          client_phone: "0713373401",
          county: "Meru",
          constituency: "Tigania West",
          ward: "Kianjai",
          amount_paid: "0.00",
          is_verified: true,
          created_at: "2026-01-20T08:50:55.124947Z",
          is_complete: false,
          worker: 2,
          job_type: 3,
          logged_by: 2,
          verified_by: 1,
          organization: 1
        },
        {
          id: 3,
          start_date: "2025-07-15",
          duration_value: 3,
          duration_unit: "weeks",
          client_name: "Njesh",
          client_phone: "078121111",
          county: "Nairobi",
          constituency: "Westlands",
          ward: "Parklands",
          amount_paid: "0.00",
          is_verified: true,
          created_at: "2026-01-24T20:45:38.723964Z",
          is_complete: false,
          worker: 2,
          job_type: 57,
          logged_by: 2,
          verified_by: 1,
          organization: 8
        }
      ],
      logged_gigs: [
        {
          id: 1,
          start_date: "2026-01-20",
          duration_value: 2,
          duration_unit: "weeks",
          client_name: "Dennis Mac",
          client_phone: "0713373401",
          county: "Meru",
          constituency: "Tigania West",
          ward: "Kianjai",
          amount_paid: "0.00",
          is_verified: true,
          created_at: "2026-01-20T08:50:55.124947Z",
          is_complete: false,
          worker: 2,
          job_type: 3,
          logged_by: 2,
          verified_by: 1,
          organization: 1
        },
        {
          id: 3,
          start_date: "2025-07-15",
          duration_value: 3,
          duration_unit: "weeks",
          client_name: "Njesh",
          client_phone: "078121111",
          county: "Nairobi",
          constituency: "Westlands",
          ward: "Parklands",
          amount_paid: "0.00",
          is_verified: true,
          created_at: "2026-01-24T20:45:38.723964Z",
          is_complete: false,
          worker: 2,
          job_type: 57,
          logged_by: 2,
          verified_by: 1,
          organization: 8
        }
      ]
    },
    {
      id: 3,
      username: "jane_doe",
      full_name: "Jane Wanjiru",
      email: "jane.wanjiru@example.com",
      phone: "0723456789",
      county: "Nairobi",
      constituency: "Starehe",
      ward: "Nairobi Central",
      is_verified: true,
      credit_score: 15,
      gigs: [
        {
          id: 10,
          start_date: "2026-01-25",
          duration_value: 1,
          duration_unit: "week",
          client_name: "Peter Omondi",
          client_phone: "0734567890",
          county: "Nairobi",
          constituency: "Langata",
          ward: "Karen",
          amount_paid: "5000.00",
          is_verified: true,
          created_at: "2026-01-25T10:00:00Z",
          is_complete: false,
          worker: 3,
          job_type: 5,
          logged_by: 3,
          verified_by: 1,
          organization: 1
        }
      ],
      logged_gigs: [
        {
          id: 11,
          start_date: "2026-01-10",
          duration_value: 2,
          duration_unit: "weeks",
          client_name: "Alice Muthoni",
          client_phone: "0745678901",
          county: "Kiambu",
          constituency: "Kiambaa",
          ward: "Ndenderu",
          amount_paid: "8000.00",
          is_verified: true,
          created_at: "2026-01-10T09:00:00Z",
          is_complete: true,
          worker: 3,
          job_type: 5,
          logged_by: 3,
          verified_by: 1,
          organization: 1
        }
      ]
    }
  ];

  constructor() {}

  ngOnInit(): void {
    this.appBar.setTitle('Manage Workers');
    this.appBar.setBack(true);
    
    // Set mobile action buttons
    this.appBar.setActions([
      { 
        id: 'search-worker',
        icon: 'search',
        ariaLabel: 'Search',
        onClick: () => {
          this.searchWorkers();
        }
      }
    ]);
  }

  ngOnDestroy(): void {
    this.appBar.setActions([]);
    this.appBar.setBack(false);
  }

  searchWorkers(): void {
    const query = this.searchQuery.trim().toLowerCase();
    
    if (!query) {
      return;
    }

    this.isLoading = true;
    this.workerData = null;
    this.cdr.detectChanges();

    // Simulate API call
    setTimeout(() => {
      // Search through demo workers by username, full_name, email, or phone
      const foundWorker = this.demoWorkers.find(worker => 
        worker.username.toLowerCase().includes(query) ||
        worker.full_name.toLowerCase().includes(query) ||
        worker.email.toLowerCase().includes(query) ||
        worker.phone.includes(query)
      );

      if (foundWorker) {
        this.workerData = foundWorker;
        this.activeTab = 'gigs';
      } else {
        this.workerData = null;
      }

      this.isLoading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  switchTab(tab: 'gigs' | 'logged'): void {
    this.activeTab = tab;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleString('en-US', options);
  }

  getGigLocation(gig: Gig): string {
    return `${gig.ward}, ${gig.constituency}, ${gig.county}`;
  }

  getGigStatus(gig: Gig): { text: string; class: string } {
    if (gig.is_complete) {
      return { text: 'Completed', class: 'completed' };
    } else if (gig.is_verified) {
      return { text: 'Verified', class: 'verified' };
    } else {
      return { text: 'Pending', class: 'pending' };
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.workerData = null;
  }
}
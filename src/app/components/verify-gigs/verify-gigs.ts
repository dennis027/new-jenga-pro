// verify-gigs.component.ts

import { Component, signal, afterNextRender, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBarService } from '../../services/app-bar-service';

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
  isMobile = signal(false);
  private appBar = inject(AppBarService);

  isLoading: boolean = true;
  unverifiedGigs: Gig[] = [];

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
    this.appBar.setTitle('Verify Gigs');
    this.appBar.setBack(true);

    setTimeout(() => {
    this.fetchUnverifiedGigs();
    },)
  }

  async fetchUnverifiedGigs(): Promise<void> {
    this.isLoading = true;

    // TODO: Replace with actual API call
    // const token = localStorage.getItem('access_token');
    // const response = await fetch(`${API_URL}/user-gigs-list/`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // const gigs = await response.json();
    // this.unverifiedGigs = gigs.filter(g => !g.is_verified);

    // Mock data
    setTimeout(() => {
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
          is_verified: false
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
          is_verified: false
        },
        {
          id: 3,
          client_name: 'Peter Omondi',
          client_phone: '+254 734 567 890',
          ward: 'Karen',
          constituency: 'Lang\'ata',
          county: 'Nairobi',
          start_date: '2026-01-18',
          duration_value: 1,
          duration_unit: 'week',
          is_verified: false
        }
      ];
      this.isLoading = false;
    }, 2000);
  }

  async verifyGig(gigId: number): Promise<void> {
    // TODO: Replace with actual API call
    // const token = localStorage.getItem('access_token');
    // await fetch(`${API_URL}/gigs/verify/${gigId}/`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ is_verified: true })
    // });

    // Mock verification
    this.unverifiedGigs = this.unverifiedGigs.filter(g => g.id !== gigId);
    
    // Show success message (you can use a snackbar service)
    console.log('Gig verified successfully!');
  }

  ngOnDestroy(): void {
    this.appBar.clearActions();
  }
}
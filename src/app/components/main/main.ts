import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MobileAppBar } from '../mobile-app-bar/mobile-app-bar';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule,MobileAppBar],
  templateUrl: './main.html',
  styleUrls: ['./main.css'],
})
export class Main {

  sidebarOpen = false;

  links = [
    { name: 'Dashboard', route: '/main-menu/', icon: 'fas fa-chart-pie' },
    { name: 'Gigs', route: '/main-menu/gigs', icon: 'fas fa-briefcase' },
    { name: 'Profile', route: '/main-menu/profile', icon: 'fas fa-user' },
     { name: 'MPesa', route: '/main-menu/mpesa', icon: 'fas fa-chart-pie' },
    { name: 'Search Gigs', route: '/main-menu/search-gigs', icon: 'fas fa-briefcase' },
    { name: 'Work History', route: '/main-menu/work-history', icon: 'fas fa-user' },
     { name: 'Proof of History', route: '/main-menu/proof-of-payments', icon: 'fas fa-chart-pie' },
    { name: 'Gig Summary', route: '/main-menu/gig-summary', icon: 'fas fa-briefcase' },
    { name: 'Credit Score', route: '/main-menu/credit-score', icon: 'fas fa-user' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.toggleBodyScroll();
  }

  closeSidebar() {
    this.sidebarOpen = false;
    this.toggleBodyScroll();
  }

  onNavLinkClick() {
    if (window.innerWidth < 992) {
      this.closeSidebar();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 992 && this.sidebarOpen) {
      this.closeSidebar();
    }
  }

  private toggleBodyScroll() {
    document.body.style.overflow = this.sidebarOpen ? 'hidden' : '';
  }

  logOut() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }  
}

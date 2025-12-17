import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-main',
  imports: [CommonModule, RouterModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {


links = [
  { name: 'Dashboard', route: 'main-menu/dashboard', icon: 'fas fa-chart-pie' },

];


  isSidebarActive = false;

  constructor(private authService : AuthService, private router:Router) {}

  ngOnInit(): void {}

  /**
   * Toggle the mobile sidebar visibility
   */
  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
    
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    }
  
    // Toggle body scroll
    this.toggleBodyScroll();
  }

  /**
   * Close sidebar when clicking outside on mobile
   */
  closeSidebar(): void {
    if (this.isSidebarActive) {
      this.isSidebarActive = false;
      
      const sidebar = document.getElementById('sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      
      if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      }

      this.toggleBodyScroll();
    }
  }

  /**
   * Handle navigation link click
   * Close sidebar on mobile after clicking a link
   */
  onNavLinkClick(): void {
    // Close mobile sidebar after clicking on mobile devices
    if (window.innerWidth <= 992) {
      this.closeSidebar();
    }
  }

  /**
   * Listen for window resize events to handle responsive behavior
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    
    // Auto-close sidebar on desktop view
    if (width > 992 && this.isSidebarActive) {
      this.closeSidebar();
    }
  }

  /**
   * Prevent body scroll when mobile sidebar is open
   */
  private toggleBodyScroll(): void {
    if (this.isSidebarActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }


logOut() {
  this.authService.logout().subscribe(() => {
    this.router.navigate(['/login']);
  });
}



}
import { Component, inject, OnInit, PLATFORM_ID, signal, afterNextRender } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Location, CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-mobile-app-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-app-bar.html',
  styleUrls: ['./mobile-app-bar.css'],
})
export class MobileAppBar implements OnInit {
  // Inject in field initializers (this is the correct way)
  private router = inject(Router);
  private location = inject(Location);
  private platformId = inject(PLATFORM_ID);
  appBar = inject(AppBarService);
  

  // Signals for reactive state
  isMobile = signal(false);
  showBack = signal(false);
  title = signal('FundiPro');

  showAccountAction = signal(false);

  constructor() {
    // Move afterNextRender logic here
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.checkScreen();
        window.addEventListener('resize', () => this.checkScreen());
      }
    });
  }

  ngOnInit() {
    // Run once on init
    this.updateFromRoute();

    // Update back button & title on navigation
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.updateFromRoute());
  }

  /** Check screen width to toggle mobile UI */
  private checkScreen() {
    this.isMobile.set(window.innerWidth <= 768); 
  }

  /** Update back button visibility and title */
private updateFromRoute() {
  const url = this.router.url;

  const isMainMenu = url === '/main-menu';

  // Back button
  this.showBack.set(!isMainMenu);

  // Action buttons
  this.showAccountAction.set(isMainMenu);

  // Titles
  const titleMap: Record<string, string> = {
    'main-menu': 'FundiPro',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    gigs: 'My Gigs',
  };

  const matchedKey = Object.keys(titleMap).find(key => url.includes(key));
  this.title.set(matchedKey ? titleMap[matchedKey] : 'FundiPro');
}


  /** Navigate back */
goBack() {
  if (window.history.length > 1) {
    this.location.back();
  } else {
    this.router.navigate(['/main-menu']);
  }
}

  

}
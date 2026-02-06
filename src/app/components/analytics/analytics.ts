import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics-service';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-analytics',
  imports: [],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics {

  private analyticsService = inject(AnalyticsService);
  private appBar = inject(AppBarService);
  private router = inject(Router);

  ngOnInit() {  
    this.appBar.setTitle('Analytics');
    this.appBar.setBack(true);
  }
}

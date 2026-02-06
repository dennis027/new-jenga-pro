import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  
   private apiUrl = environment.apiUrl + 'api/';

  constructor(private http: HttpClient) {}

  gigTrends(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/gig-trends/'); 
  }

  workerPerformance(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/worker-performance/'); 
  }

  jobTypes(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/job-types/'); 
  }

  organizationPerformance(): Observable<any> { 
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/organization-performance/'); 
  }

  revenue(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/revenue/'); 
  }
  location(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/location/'); 
  }

  verification(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/verification/'); 
  }

  workerRetention(id:any): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/worker-retention/'); 
  }

  comparativeE(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/comparative/'); 
  }
  summary(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/analytics/summary/'); 
  }

}

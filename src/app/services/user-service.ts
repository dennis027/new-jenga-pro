import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl + 'api/';

  constructor(private http: HttpClient) {}

  getUserDetails(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'user/'
    );
  }

  updateUserDetails(payload: any): Observable<any> {
    return this.http.put<any>(
      this.apiUrl + 'profile/',
      payload
    );
  }

  jengaStart(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/dashboard/stats/'); 
  }

  recentGigs(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/dashboard/recent-gigs/'); 
  }

  topSites(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/dashboard/top-sites/'); 
  }

  topWorkers(): Observable<any> { 
    return this.http.get<any>(this.apiUrl + 'contractor/dashboard/top-workers/'); 
  }

  calendar(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/dashboard/calendar/'); 
  }
  orgsContract(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/organizations/'); 
  }

  fundiStats(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/dashboard/stats/'); 
  }

  userRecentWorks(id:any): Observable<any> {
    return this.http.get<any>(this.apiUrl + `contractor/organizations/${id}/gigs/`); 
  }

  unverifiedGigs(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'contractor/dashboard/unverified-gigs/'); 
  }


}

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { HttpContextToken, HttpContext } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GigServices {
  private apiUrl = environment.apiUrl+'api/';


  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  getGigsAvailable(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'gigs-available/'); 
  }


  addGig(payload:any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'gigs/', payload);
  }

  userRelatedGigs(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'user-gigs/');  
  }

  searchGigs(county: string, constituency: string, ward:string): Observable<any> {
    return this.http.get<any>(this.apiUrl + `search-gigs/?county=${county}&constituency=${constituency}&ward=${ward}`); 
  }
  
  completeGig(gigId: number): Observable<any> {
    return this.http.post<any>(this.apiUrl + `gig/${gigId}/complete/`, {}); 
  }

  creditScoreHistory(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'credit-history/'); 
  }
}

 
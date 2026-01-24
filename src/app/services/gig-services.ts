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

  getUnverifiedGigs(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'gigs-list/'
    );
  }

  verifyGig(gigId: number): Observable<any> {
    return this.http.post<any>(
      this.apiUrl + `/gigs/verify/${gigId}/`,
      {}
    );
  }
}

 
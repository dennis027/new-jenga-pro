import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { TokenService } from './token-service';

@Injectable({
  providedIn: 'root',
})
export class GigServices {
  private apiUrl = environment.apiUrl + 'api/';

  constructor(
    private http: HttpClient,
      private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


private getAuthHeaders(): HttpHeaders {
  let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  const token = this.tokenService.getToken();
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

  getUnverifiedGigs(): Observable<any> {
    return this.http.get(this.apiUrl + 'org-gigs-list/', {
      headers: this.getAuthHeaders(),
    });
  }

  verifyGig(gigId: number): Observable<any> {
    return this.http.post(this.apiUrl + `gigs/verify/${gigId}/`, {}, {
      headers: this.getAuthHeaders(),
    });
  }
}

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpContext, HttpContextToken } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

// This token is the "Passport" that lets the request skip the Interceptor
export const BYPASS_JWTAUTH = new HttpContextToken(() => false);

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + 'api/login/';
  private logoutUrl = environment.apiUrl + 'api/logout/';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  login(payload: { identifier: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload, {
      // 🟢 This tells the interceptor to ignore this specific request
      context: new HttpContext().set(BYPASS_JWTAUTH, true)
    }).pipe(
      tap(res => {
        if (!isPlatformBrowser(this.platformId)) return;
        if (!res?.access || !res?.refresh) return;

        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
      })
    );
  }

  getAccessToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('access_token') : null;
  }

  logout(): Observable<any> {
    const accessToken = this.getAccessToken();
    const refreshToken = isPlatformBrowser(this.platformId) ? localStorage.getItem('refresh_token') : null;

    let headers = new HttpHeaders();
    if (accessToken) {
      headers = headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return this.http.post<any>(this.logoutUrl, { refresh: refreshToken }, { 
      headers,
      // 🟢 We bypass auth here too because you're manually setting the header above
      context: new HttpContext().set(BYPASS_JWTAUTH, true) 
    }).pipe(
      tap({
        next: () => this.clearStorage(),
        error: () => this.clearStorage()
      })
    );
  }

  private clearStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
}
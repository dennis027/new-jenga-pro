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
export class SitesService {
  private apiUrl = environment.apiUrl+'api/';
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  getSites(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'organizations/');  
  }

  getUserSites(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'user-organizations/');  
  }

  addSite(payload:any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'organizations/', payload);
  }
  updateSite(siteId: number, payload:any): Observable<any> {
    return this.http.put<any>(this.apiUrl + `organization/${siteId}/`, payload);
  }

  deleteSite(siteId: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + `organization/${siteId}/`);
  }
}

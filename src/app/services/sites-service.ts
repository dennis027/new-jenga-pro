import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SitesService {
  private apiUrl = environment.apiUrl + 'api/';

  constructor(private http: HttpClient) {}

  getUserSites(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'user-organizations/'
    );
  }

  addSite(payload: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrl + 'organizations/',
      payload
    );
  }

  updateSite(siteId: number, payload: any): Observable<any> {
    return this.http.put<any>(
      this.apiUrl + `organizations/${siteId}/`,
      payload
    );
  }

  deleteSite(siteId: number): Observable<any> {
    return this.http.delete<any>(
      this.apiUrl + `organizations/${siteId}/`
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MpesaService {
  private baseUrl = environment.apiUrl+'/api/'; // change if needed

  constructor(private http: HttpClient) {}

  /**
   * 🔔 Initiate STK Push
   * POST /api/stk-new-push/
   */
  stkPush(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}stk-new-push/`,
      payload
    );
  }

  /**
   * 📩 Get single Mpesa messages
   * GET /api/single-messages/
   */
  getSingleMessages(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}single-messages/`
    );
  }
}

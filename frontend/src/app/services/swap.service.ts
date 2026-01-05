import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class SwapService {
  private apiUrl = '/swap'; //he cambiado la ruta base de la api para así poder pillar en este mismo service diferentes datos

  constructor(private http: HttpClient) {}
  
  getNextSwap(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/showNextSwap`, {
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }

  getAllSwaps(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getAllSwaps`);
  }
  updateSwapStatus(swapId: string, status: 'ACCEPTED' | 'DENIED'): Observable<any> {
    const params = new HttpParams().set('status', status);
    return this.http.patch(`${this.apiUrl}/${swapId}/status`, {}, { 
      params,
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }
}

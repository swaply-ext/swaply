import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';

export interface location {
  placeId: string;
  displayName: string;
  lat: number;
  lon: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private apiUrl = '/locations';

  constructor(private http: HttpClient) { }

  autocompleteLocation(query: string): Observable<any> {
    const params = new HttpParams().set('query', query);
    return this.http.get<location[]>(`${this.apiUrl}/autocomplete`, { params, context: new HttpContext().set(SKIP_LOADING, true) });
  }

  
  getDistance(user1_id: string, user2_username: string): Observable<string> {
    const params = new HttpParams()
      .set('user1_id', user1_id)
      .set('user2_username', user2_username);

    return this.http.post(`${this.apiUrl}/distance`, null, { 
      params, 
      responseType: 'text',
      context: new HttpContext().set(SKIP_LOADING, true) 
    });
  }
}

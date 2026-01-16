import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';
import { UserLocation } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private apiUrl = '/locations';

  constructor(private http: HttpClient) { }

  autocompleteLocation(query: string): Observable<any> {
    const params = new HttpParams().set('query', query);
    return this.http.get<UserLocation[]>(`${this.apiUrl}/autocomplete`, { params, context: new HttpContext().set(SKIP_LOADING, true) });
  }
}

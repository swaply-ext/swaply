import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';
import { UserSearchItem } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = '/users';

  constructor(private http: HttpClient) { }

  // CORRECCIÓN: recibir el id como parámetro y añadirlo a la URL
  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  searchUsers(query: string): Observable<any[]> {
    if (!query.trim()) return of([]);
    const params = new HttpParams().set('contains', query);
    return this.http.get<UserSearchItem[]>(this.apiUrl, {
      params,
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }

  getUsername(id?: string): Observable<string> {
    let params = new HttpParams();
    
    //condicion en el enpoint del backend, si hay id, se lo pasa /username/?id=... o si es null pilla la del token.
    //poder buscar username por id de otros, o sin id y pillar el propio.
    if (id) {
      params = params.set('id', id);
    }
    return this.http.get(`${this.apiUrl}/username`, { 
      params: params,
      responseType: 'text' 
    });
  }

}
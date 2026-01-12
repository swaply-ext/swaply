import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';
import { SwapDTO } from '../models/swapDTO.model';
import { UserSwapDTO } from '../models/userSwapDTO.model';



@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);

  getMatches(skill: string): Observable<UserSwapDTO[]> {
    const params = new HttpParams().set('skill', skill);
    return this.http.get<UserSwapDTO[]>(`/search/match`, {
      params,
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }

  getRecommendations(): Observable<UserSwapDTO[]> {
    return this.http.get<UserSwapDTO[]>(`/home/recommendations`, {
      context: new HttpContext().set(SKIP_LOADING, true),
    })
    .pipe(
      tap(users => users.forEach(user => console.log(user)))
    );
  }

  getUserByUsername(username: string): Observable<UserSwapDTO> {
    return this.http.get<UserSwapDTO>(`/search/user/${username}`);
  }

  sendSwapRequest(payload: SwapDTO): Observable<any> {
    // cambiamos a patch y usamos el endpoint solicitado
    return this.http.patch(`/swap/request`, payload);
  }
}

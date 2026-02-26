import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';
import { SwapDTO } from '../models/swapDTO.model';
import { UserSwapDTO } from '../models/userSwapDTO.model';



@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);

  getMatches(skill: string, page: number, size: number): Observable<UserSwapDTO[]> {
    const params = new HttpParams()
        .set('skill', skill)
        .set('page', page.toString())
        .set('size', size.toString());
    return this.http.get<UserSwapDTO[]>(`/search/match`, {
      params,
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }

  getRecommendations(page: number, size: number): Observable<UserSwapDTO[]> {
    const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());
    return this.http.get<UserSwapDTO[]>(`/home/recommendations`, {
      params,
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }

  getUserByUsername(username: string): Observable<UserSwapDTO> {
    return this.http.get<UserSwapDTO>(`/search/user/${username}`, {
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }

  sendSwapRequest(payload: SwapDTO): Observable<any> {
    // cambiamos a patch y usamos el endpoint solicitado
    return this.http.patch(`/swap/request`, payload);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor'; 

export interface UserSwapDTO {
  userId: string;
  name: string;
  username: string;
  profilePhotoUrl: string;
  location: string;
  
  skillName: string;
  skillIcon: string;
  skillLevel: number;
  skillCategory: string;
  
  isSwapMatch: boolean;
  rating: number;
  distance: string;

  // lista opcional de skills que viene del back
  userSkills?: {
    name: string;
    category: string;
    level: number;
  }[];
}

// dto para la petición de intercambio
export interface SwapDTO {
  requestedUsername: string;
  skill: string;
  interest: string;
}

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
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }
  
  getUserByUsername(username: string): Observable<UserSwapDTO> {
    return this.http.get<UserSwapDTO>(`/search/user/${username}`);
  }
  
  sendSwapRequest(payload: SwapDTO): Observable<any> {
    // cambiamos a patch y usamos el endpoint solicitado
    return this.http.patch(`/swap/request`, payload);
  }
}
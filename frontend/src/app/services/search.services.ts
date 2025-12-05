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
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api'; 

  getMatches(skill: string): Observable<UserSwapDTO[]> {
    const params = new HttpParams().set('skill', skill);
    return this.http.get<UserSwapDTO[]>(`${this.apiUrl}/search/match`, { 
      params,
      context: new HttpContext().set(SKIP_LOADING, true) 
    });
  }

  getRecommendations(): Observable<UserSwapDTO[]> {   
    return this.http.get<UserSwapDTO[]>(`${this.apiUrl}/home/recommendations`, {
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }
}
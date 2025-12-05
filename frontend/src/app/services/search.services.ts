import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getMatches(skill: string): Observable<UserSwapDTO[]> {
    const params = new HttpParams().set('skill', skill);
    return this.http.get<UserSwapDTO[]>(`${this.apiUrl}/search/match`, { params });
  }

  getRecommendations(): Observable<UserSwapDTO[]> {   
    return this.http.get<UserSwapDTO[]>(`${this.apiUrl}/home/recommendations`);
  }

  getUserById(userId: string): Observable<UserSwapDTO> {
    return this.http.get<UserSwapDTO>(`${this.apiUrl}/search/user/${userId}`);
  }
}

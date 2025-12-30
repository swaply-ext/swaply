import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';

export interface Account {
  interests: { id: string, level: number }[];
  skills?: { id: string, level: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  // Ajusta la URL base si es necesario
  private apiUrl = '/account'; 

  constructor(private http: HttpClient) { }

  getProfileData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profileData`);
  }

  updateProfileData(data: any): Observable<boolean> {
    return this.http.patch<boolean>(`${this.apiUrl}/changeData`, data);
  }

  getEditProfileData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/editProfileData`);
  }

  updateEditProfileData(data: any): Observable<boolean> {
    return this.http.patch<boolean>(`${this.apiUrl}/editProfileData`, data);
  }

  changesStatusSwap(data: any): Observable<boolean> {
    return this.http.patch<boolean>(`${this.apiUrl}/changesStatusSwap`, data);
  }

  uploadProfilePhoto(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.apiUrl}/upload-photo`,
      formData,
      { responseType: 'text' }
    );
  }

  //obtenir el perfil públic d'ALGÚ ALTRE
  getPublicProfile(targetUsername: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/public/${targetUsername}`);
  }

  deleteAccount(): Observable<any> {
    // Asegúrate de que esta ruta coincida con tu backend (/delete o raíz)
    return this.http.delete(`${this.apiUrl}/deleteProfile`);
  }

  searchSkills(query: string): Observable<any[]> {
    if (!query || !query.trim()) {
      return of([]);
    }

    const params = new HttpParams().set('query', query);

    return this.http.get<any[]>(
      `${this.apiUrl}/skills`,
      {
        params,
        context: new HttpContext().set(SKIP_LOADING, true)
      }
    );
  }

  getAccount(): Observable<Account> {
    return this.http.get<Account>(this.apiUrl);
  }

  updateInterests(interests: { id: string, level: number }[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/interests`, { interests });
  }

  personalInfo(allUserData:any): Observable<any> {
    return this.http.post(`${this.apiUrl}/personalInfo`, allUserData);
  }
  verifyCode(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verifyCode`, code);
  }

  updateSkills(skills: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/skills`, { skills });
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SkillData } from '../models/data.models';



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

  getUsername(): Observable<{ username: string }> {
    return this.http.get<{ username: string }>(`${this.apiUrl}/username`);
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

  getAccount(): Observable<SkillData> {
    return this.http.get<SkillData>(this.apiUrl);
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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  // Ajusta la URL base si es necesario
  private apiUrl = 'http://localhost:8081/api/account'; 

  constructor(private http: HttpClient) {}

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

  uploadProfilePhoto(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); 

    // { responseType: 'text' } es necesario porque el backend devuelve un String (la URL)
    return this.http.post(
      `${this.apiUrl}/upload-photo`, 
      formData, 
      { responseType: 'text' } 
    );
  }

  deleteAccount(): Observable<any> {
    // Asegúrate de que esta ruta coincida con tu backend (/delete o raíz)
    return this.http.delete(`${this.apiUrl}/deleteProfile`);
  }
}
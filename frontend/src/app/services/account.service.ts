import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// este es el servicio para que en la vista de perfil de usuario segun el t token, llame a la API de profileData
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8081/api/account'; //he cambiado la ruta base de la api para así poder pillar en este mismo service diferentes datos

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

    // 'responseType: text' es vital porque el backend devuelve un String plano (la URL)
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
}

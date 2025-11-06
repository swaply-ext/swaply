import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// este es el servicio para que en la vista de perfil de usuario segun el t token, llame a la API de profileData
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8081/api/account/profileData';

  constructor(private http: HttpClient) {}

  getProfileData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}

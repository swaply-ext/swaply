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
}

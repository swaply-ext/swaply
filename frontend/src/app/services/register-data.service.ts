import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegisterDataService {
  private registerData: any = {};

  constructor(private http: HttpClient) { }

  setRegisterData(data: any) {
    this.registerData = { ...this.registerData, ...data };
  }

  getRegisterData() {
    return this.registerData;
  }

  clearData() {
    this.registerData = {};
  }

  // Registra usuario en el backend usando URL completa y recibe respuesta como texto
  registerUser(data: { email: string; password: string }): Observable<any> {
    return this.http.post('http://localhost:8081/api/auth/register', data, {
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<string>) => {
        // si no existe se crea, devolvemos la respuesta
        if (response.status === 201) {
          return response.body;
        } else {
          throw new Error('Error al registrar el usuario');
        }
      }),
      catchError(err => {
        // 409 Conflict = correo o usuario duplicado
        if (err.status === 409) {
          return throwError(() => new Error('Correo ya registrado'));
        }
        return throwError(() => new Error('Error al registrar el usuario'));
      })
    );
  }
}

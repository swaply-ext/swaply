import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterDataService {
  private registerData: any = {};

  constructor(private http: HttpClient) {}

  setRegisterData(data: any) {
    this.registerData = { ...this.registerData, ...data };
  }

  getRegisterData() {
    return this.registerData;
  }

  clearData() {
    this.registerData = {};
  }

  // Llama al backend para registrar inicialmente (verifica email y username)
  initialRegister(data: RegisterUserDTO): Observable<any> {
    return this.http.post('http://localhost:8081/api/auth/register', data, {
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<string>) => {
        if (response.status === 201) {
          return response.body;
        } else {
          throw new Error('Error al registrar el usuario');
        }
      }),
      catchError(err => {
        if (err.status === 409) { // Conflict
          if (err.error.includes('email')) {
            return throwError(() => new Error('Email ya registrado'));
          } else if (err.error.includes('username')) {
            return throwError(() => new Error('Username ya registrado'));
          } else {
            return throwError(() => new Error('Correo o username ya registrado'));
          }
        }
        return throwError(() => new Error('Error al registrar el usuario'));
      })
    );
  }
}

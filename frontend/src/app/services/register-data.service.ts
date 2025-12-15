import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
}

interface Location {
  placeId: string;
  lat: number;
  lon: number;
  displayName: string;
}

interface AllUserData {
  name: string;
  surname: string;
  birthDate: Date;
  gender: string;
  location: Location;
  phone: number;
}

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

  // 🔹 Llama al backend para registrar inicialmente (verifica email y username)
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

  personalInformation(data: AllUserData): Observable<any> {
    return this.http.post('http://localhost:8081/api/account/personalInfo', data, {
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<string>) => {
        if (response.status === 202) {
          return response.body;
        } else {
          throw new Error('Error al actualizar información:');
        }
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Error del servidor al actualizar información personal:', err);
        console.log(err)

        let errorMessage = 'Error al actualizar información. Inténtalo más tarde.';

        if (err.status === 400) {
          errorMessage = 'Datos inválidos. Por favor, revisa el formulario.';
        } else if (err.status === 403) {
          errorMessage = 'Acceso denegado. La sesión puede haber expirado.';
        } else if (err.status === 500){
          errorMessage = 'Error 500';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}

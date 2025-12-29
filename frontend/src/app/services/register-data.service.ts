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

  //  Llama al backend para registrar inicialmente (verifica email y username)
  initialRegister(data: RegisterUserDTO): Observable<any> {
    return this.http.post(`/auth/register`, data, {
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<string>) => {
        if (response.status === 201) {
          return response.body;
        }
        throw new Error('Error al registrar el usuario');
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409) { // Conflict
          const errorMsg =  err.error.includes('email') ? 'Email ya registrado' :
                            err.error.includes('username') ? 'Username ya registrado' :
                            'Correo o username ya registrado';

          return throwError(() => new Error(errorMsg));
        }
        return throwError(() => new Error('Error al registrar el usuario'));
      })
    );
  }

  personalInformation(data: AllUserData): Observable<any> {
    return this.http.post(`/account/personalInfo`, data, {
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<string>) => {
        if (response.status === 202) {
          return response.body;
        }
        throw new Error('Error al actualizar información:');
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Error del servidor al actualizar información personal:', err);

        const errorMessages: { [key: number]: string } = {
          400: 'Datos inválidos. Por favor, revisa el formulario.',
          403: 'Acceso denegado. La sesión puede haber expirado.',
          500: 'Error 500'
        };

        const errorMessage = errorMessages[err.status] || 'Error al actualizar información. Inténtalo más tarde.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}

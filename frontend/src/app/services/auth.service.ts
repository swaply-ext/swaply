import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  isLoggedIn = signal<boolean>(!!localStorage.getItem('authToken'));

  login(credentials: any) {
    console.log(this.isLoggedIn())
    return this.http.post('http://localhost:8081/api/auth/login', credentials, {

      // SALTAR PANTALLA DE CARGA
      // context: new HttpContext().set(SKIP_LOADING, true),
      responseType: 'text',
      observe: 'response'
    }).pipe(

      tap((response) => {
        if (response.status === 200) {
          const token = response.body as string;
          localStorage.setItem('authToken', token);
          this.isLoggedIn.set(true);
        }
      })
    );
  }

  public autenticateUser(token: string): void {
    localStorage.setItem('authToken', token);
    this.isLoggedIn.set(true);
  }



  logout() {
    localStorage.removeItem('authToken');
    this.isLoggedIn.set(false);
  }

}

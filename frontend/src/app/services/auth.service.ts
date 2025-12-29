import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) { }

  isLoggedIn = signal<boolean>(!!localStorage.getItem('authToken'));

  login(credentials: any) {
    console.log(this.isLoggedIn())
    return this.http.post(`${this.baseUrl}/login`, credentials, {

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

  verifyRegistrationCode(email: string, code: string): Observable<HttpResponse<string>> {
    const verifyData = { email, code };
    return this.http.post(`${this.baseUrl}/registerCodeVerify`, verifyData, {
      responseType: 'text',
      observe: 'response'
    });
  }

  passwordReset(token: string, password: string): Observable<HttpResponse<any>> {
    const payload = { token, password };
    return this.http.post(`${this.baseUrl}/passwordReset`, payload, {
      observe: 'response'
    });
  }

  sendRecoveryMail(email: string): Observable<HttpResponse<any>> {
    return this.http.post(`${this.baseUrl}/recoveryMail`, email, {
      observe: 'response'
    });
  }
}

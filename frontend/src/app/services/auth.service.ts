import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private baseUrl = '/auth';

  isLoggedIn = signal<boolean>(!!localStorage.getItem('authToken'));

  login(credentials: any) {
    console.log(this.isLoggedIn());
    return this.http.post(`${this.baseUrl}/login`, credentials, {
      responseType: 'text',
      observe: 'response'
    }).pipe(
      tap((response: HttpResponse<string>) => {
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


  getToken(): string | null {
    return localStorage.getItem('authToken');
  }


  getUserIdFromToken(): string {
    const token = this.getToken();
    if (!token) return '';

    try {
      const payload = token.split('.')[1];

      const decodedPayload = atob(payload);

      const parsed = JSON.parse(decodedPayload);

      return parsed.sub || '';
    } catch (error) {
      return '';
    }
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

  changePassword(credentials: {password: string, newPassword: string}) {
    return this.http.post(`${this.baseUrl}/passwordChange`, credentials, {
      observe: 'response'
    });
  }
}

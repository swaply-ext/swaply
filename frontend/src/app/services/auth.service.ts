import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // URL base para no repetir código
  private baseUrl = '/auth';

  isLoggedIn = signal<boolean>(!!localStorage.getItem('authToken'));

  login(credentials: any) {
    console.log(this.isLoggedIn());
    return this.http.post(`${this.baseUrl}/login`, credentials, {
      // context: new HttpContext().set(SKIP_LOADING, true),
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

  // -----------------------------------------------------------------------
  // NUEVOS MÉTODOS NECESARIOS PARA EL CHAT
  // -----------------------------------------------------------------------

  /**
   * Devuelve el token en crudo. 
   * Necesario para que el ChatService pueda conectarse al WebSocket.
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Extrae el ID (o username) del usuario desde el Token JWT.
   * Necesario para saber de qué lado pintar los mensajes (derecha o izquierda).
   */
  getUserIdFromToken(): string {
    const token = this.getToken();
    if (!token) return '';

    try {
      // El JWT tiene 3 partes separadas por puntos. La segunda es el payload.
      const payload = token.split('.')[1];
      
      // Decodificamos de Base64 a string
      const decodedPayload = atob(payload); 
      
      // Convertimos a objeto JSON
      const parsed = JSON.parse(decodedPayload);
      
      // 'sub' es el campo estándar donde Spring Security guarda el usuario
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
  
  /**
   * Envía la solicitud de cambio de contraseña.
   * El HttpInterceptor se encargará de añadir el token en el header.
   */
  changePassword(credentials: {password: string, newPassword: string}) {
    return this.http.post(`${this.baseUrl}/passwordChange`, credentials, {
      observe: 'response' // Necesario para leer el status 200 completo
    });
  }
}

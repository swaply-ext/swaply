import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  isLoggedIn = signal<boolean>(!!localStorage.getItem('authToken'));

  login(credentials: any) {
    return this.http.post('http://localhost:8081/api/auth/login', credentials, {
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

logout() {
      localStorage.removeItem('authToken');
      this.isLoggedIn.set(false);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { LoginRegisterButtonsComponent } from '../../components/login-register-buttons/login-register-buttons.component';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface User {
  email: string;
  password: string;
}

@Component({
  selector: 'login-form', // Nombre del componente en el HTML
  standalone: true,
  imports: [              // Componentes y módulos que se usan en la plantilla
    EmailInputComponent,
    PasswordInputComponent,
    TermsCheckboxComponent,
    RouterLink,
    LoginRegisterButtonsComponent,
    CommonModule
  ],
  templateUrl: './login-form.component.html', // Ruta al archivo HTML
  styleUrls: ['./login-form.component.css']   // Ruta al archivo CSS
})
// Propiedades que almacenan el estado del formulario
export class LoginFormComponent {
  email = '';
  password = '';
  accepted = false;
  showError = false;

  constructor(private router: Router, private http: HttpClient) { }

  login() {
    this.showError = false;
    this.email = this.email.toLowerCase();

    // Habria que cambiar el alert por algo mas bonito
    if (!this.accepted) {
      this.showError =true;
      return;
    }
    if (!this.email || !this.password) {
      this.showError =true;
      return;
    }
    // Crea el objeto usuario con los datos del formulario
    const newUser: User = {
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:8081/api/auth/login', newUser, { responseType: 'text', observe: 'response' })
      .subscribe({
        next: (response: HttpResponse<Object>) => {

          if (response.status == 200) {
            console.log(response.status);
            console.log("Login correcto");
            console.log('Respuesta del backend:', response);
            const token = response.body as string;
            localStorage.setItem('authToken', token);
            console.log("Token recibido:", token);
          }
          else {
            this.router.navigate(['/error-auth']);
          }

        },
        error: err => {
          if (err.status == 401) {
            console.log(err.status);
            console.log("Credenciales Incorrectas");

          } else {
            console.error('Error enviando login:', err);
            // Error de conexión -> también /error-auth
            this.router.navigate(['/error-auth']);
          }

        }
      });
  }

  register() {
    this.router.navigate(['/register']);
  }
}

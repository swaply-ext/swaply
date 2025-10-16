import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { LoginRegisterButtonsComponent } from '../../components/login-register-buttons/login-register-buttons.component';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface User {
  email: string;
  password: string; 
}

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [
    EmailInputComponent,
    PasswordInputComponent,
    TermsCheckboxComponent,
    RouterLink,
    LoginRegisterButtonsComponent,
    HttpClientModule
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  email = '';
  password = '';
  accepted = false;

  constructor(private router: Router, private http: HttpClient) { }

  login() {
    if (!this.accepted) {
      alert('Debes aceptar los términos');
      return;
    }
    if (!this.email || !this.password) {
      alert('Debes rellenar todos los campos');
      return;
    }

    const newUser: User = {
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:8081/api/account/login', newUser, { responseType: 'text' })
      .subscribe({
        next: (response: string) => {
          console.log('Respuesta del backend:', response);

          // Si hay un token/UUID -> login correcto
          if (response && response.length > 0) {
            this.router.navigate(['/']);
          } else {
            // Contraseña incorrecta o usuario no encontrado -> /error-auth
            this.router.navigate(['/error-auth']);
          }
        },
        error: err => {
          console.error('Error enviando login:', err);
          // Error de conexión -> también /error-auth
          this.router.navigate(['/error-auth']);
        }
      });
  }

  register() {
    this.router.navigate(['/register']); 
  }
}

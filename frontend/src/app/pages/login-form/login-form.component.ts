import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { LoginButtonComponent } from '../../components/login-button/login-button.component';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { LoginRegisterButtonsComponent } from '../../components/login-register-buttons/login-register-buttons.component';
 
// Interfaz que define la estructura del objeto usuario
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
    HttpClientModule
  ],
  templateUrl: './login-form.component.html', // Ruta al archivo HTML
  styleUrls: ['./login-form.component.css']   // Ruta al archivo CSS
})
// Propiedades que almacenan el estado del formulario
export class LoginFormComponent {
  email = '';
  password = '';
  accepted = false;

  // Constructor con inyección de dependencias: Router para navegación, HttpClient para peticiones HTTP
  constructor(private router: Router, private http: HttpClient) { }

  login() {
    // Habria que cambiar el alert por algo mas bonito
    if (!this.accepted) {
      alert('Debes aceptar los términos');
      return;
    }
    if (!this.email || !this.password) {
      alert('Debes rellenar todos los campos');
      return;
    }
    // Crea el objeto usuario con los datos del formulario
    const newUser: User = {
      email: this.email,
      password: this.password
    };

    // Envía una petición POST al backend con el objeto usuario
    this.http.post<boolean>('http://localhost:8081/api/account/login', newUser)
    .subscribe({
      // Si la respuesta es true, redirige al inicio; si no, a la página de error
      next: (response) => {
        console.log('Respuesta del backend:', response);
        if (response === true) {
          this.router.navigate(['/']);
      } else {
        this.router.navigate(['/error-auth']);
      }
    },
      error: err => {
        console.error('Error enviando login:', err);
      alert('Error de conexión con el servidor');
    }
  });
}
// Método que redirige al usuario a la página de registro
register() {
  this.router.navigate(['/register']); 
}
}
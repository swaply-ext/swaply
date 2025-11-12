import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { LoginRegisterButtonsComponent } from '../../components/login-register-buttons/login-register-buttons.component';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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
  private authService = inject(AuthService);
  constructor(private router: Router, private http: HttpClient,) { }


  login() {

    this.showError = false;
    this.email = this.email.toLowerCase();

    if (!this.accepted) {
      this.showError = true;
      return;
    }
    if (!this.email || !this.password) {
      this.showError = true;
      return;
    }

    const newUser: User = {
      email: this.email,
      password: this.password
    };

    this.authService.login(newUser).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.status == 401) {
          console.log("Credenciales Incorrectas");
        } else {
          this.router.navigate(['/error-auth']);
        }
      }
    });
  }

  register() {
    this.router.navigate(['/register']);
  }
}

